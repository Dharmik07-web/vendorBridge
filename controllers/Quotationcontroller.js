const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');

// @desc    Submit a quotation for an RFQ
// @route   POST /api/quotations
// @access  Private (vendor)
exports.submitQuotation = asyncHandler(async (req, res) => {
  const { rfqId, items, deliveryTimeline, deliveryTerms, paymentTerms, warranty, validUntil, notes, taxRate } = req.body;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  if (rfq.status !== 'published') {
    return res.status(400).json({ success: false, message: 'RFQ is not open for quotations.' });
  }

  if (new Date() > new Date(rfq.deadline)) {
    return res.status(400).json({ success: false, message: 'RFQ deadline has passed.' });
  }

  // Determine vendor ID
  const vendorId = req.user.vendorProfile;
  if (!vendorId) {
    return res.status(400).json({ success: false, message: 'No vendor profile linked to this account.' });
  }

  // Check if vendor is assigned to this RFQ
  const isAssigned = rfq.assignedVendors.some(
    (av) => av.vendor.toString() === vendorId.toString()
  );
  if (!isAssigned && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not invited for this RFQ.' });
  }

  // Check for duplicate submission
  const existing = await Quotation.findOne({ rfq: rfqId, vendor: vendorId, status: { $ne: 'withdrawn' } });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already submitted a quotation for this RFQ.' });
  }

  const quotation = await Quotation.create({
    rfq: rfqId,
    vendor: vendorId,
    submittedBy: req.user._id,
    items,
    deliveryTimeline,
    deliveryTerms,
    paymentTerms,
    warranty,
    validUntil,
    notes,
    taxRate: taxRate || 18,
  });

  // Update vendor status in RFQ
  await RFQ.updateOne(
    { _id: rfqId, 'assignedVendors.vendor': vendorId },
    { $set: { 'assignedVendors.$.status': 'responded' } }
  );

  // Notify procurement officers
  const officers = await User.find({ role: { $in: ['procurement_officer', 'admin'] } }).select('_id');
  await createNotification({
    recipients: officers.map((u) => u._id),
    title: 'New Quotation Submitted',
    message: `A new quotation has been submitted for RFQ: ${rfq.rfqNumber} - ${rfq.title}`,
    type: 'quotation_submitted',
    relatedModel: 'Quotation',
    relatedId: quotation._id,
  });

  await logActivity({
    userId: req.user._id,
    action: 'SUBMIT_QUOTATION',
    module: 'Quotation',
    description: `Quotation submitted: ${quotation.quotationNumber} for ${rfq.rfqNumber}`,
    relatedModel: 'Quotation',
    relatedId: quotation._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: quotation });
});

// @desc    Get all quotations (filtered)
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = asyncHandler(async (req, res) => {
  const { rfqId, status, vendorId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (rfqId) filter.rfq = rfqId;
  if (status) filter.status = status;
  if (vendorId) filter.vendor = vendorId;

  // Vendors only see their own quotations
  if (req.user.role === 'vendor') {
    filter.vendor = req.user.vendorProfile;
  }

  const [quotations, total] = await Promise.all([
    Quotation.find(filter)
      .populate('rfq', 'rfqNumber title category deadline status')
      .populate('vendor', 'companyName email contactPerson rating')
      .populate('submittedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Quotation.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: quotations.length,
    total,
    page: Number(page),
    data: quotations,
  });
});

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate('rfq', 'rfqNumber title category deadline items deliveryLocation')
    .populate('vendor', 'companyName email phone contactPerson gstNumber address rating')
    .populate('submittedBy', 'firstName lastName email');

  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  // Vendors can only view their own
  if (
    req.user.role === 'vendor' &&
    quotation.vendor._id.toString() !== req.user.vendorProfile?.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.status(200).json({ success: true, data: quotation });
});

// @desc    Compare quotations for an RFQ (side-by-side)
// @route   GET /api/quotations/compare/:rfqId
// @access  Private (procurement_officer, manager, admin)
exports.compareQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  const rfq = await RFQ.findById(rfqId).select('title rfqNumber items category');
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  const quotations = await Quotation.find({
    rfq: rfqId,
    status: { $nin: ['withdrawn', 'rejected'] },
  })
    .populate('vendor', 'companyName email contactPerson rating totalOrders gstNumber')
    .sort({ totalAmount: 1 });

  if (!quotations.length) {
    return res.status(200).json({ success: true, data: { rfq, quotations: [], lowestPriceId: null } });
  }

  // Mark lowest price
  const lowestAmount = quotations[0].totalAmount;
  const lowestPriceId = quotations[0]._id;

  // Update isLowestPrice flags
  await Quotation.updateMany({ rfq: rfqId }, { isLowestPrice: false });
  await Quotation.findByIdAndUpdate(lowestPriceId, { isLowestPrice: true });

  // Build comparison matrix
  const comparison = {
    rfq,
    quotations: quotations.map((q) => ({
      _id: q._id,
      quotationNumber: q.quotationNumber,
      vendor: q.vendor,
      items: q.items,
      subtotal: q.subtotal,
      taxAmount: q.taxAmount,
      totalAmount: q.totalAmount,
      deliveryTimeline: q.deliveryTimeline,
      deliveryTerms: q.deliveryTerms,
      paymentTerms: q.paymentTerms,
      warranty: q.warranty,
      validUntil: q.validUntil,
      isLowestPrice: q.totalAmount === lowestAmount,
      status: q.status,
      createdAt: q.createdAt,
    })),
    summary: {
      totalQuotations: quotations.length,
      lowestPrice: lowestAmount,
      highestPrice: quotations[quotations.length - 1]?.totalAmount,
      lowestDelivery: Math.min(...quotations.map((q) => q.deliveryTimeline)),
    },
  };

  res.status(200).json({ success: true, data: comparison });
});

// @desc    Shortlist / Reject a quotation
// @route   PATCH /api/quotations/:id/review
// @access  Private (procurement_officer, admin)
exports.reviewQuotation = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!['shortlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be shortlisted or rejected.' });
  }

  const quotation = await Quotation.findById(req.params.id).populate('vendor', 'companyName').populate('rfq', 'rfqNumber title');
  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  quotation.status = status;
  quotation.reviewedBy = req.user._id;
  quotation.reviewedAt = Date.now();
  if (status === 'rejected' && rejectionReason) {
    quotation.rejectionReason = rejectionReason;
  }
  await quotation.save();

  // Notify vendor user
  const vendorUser = await User.findOne({ vendorProfile: quotation.vendor._id });
  if (vendorUser) {
    await createNotification({
      recipients: [vendorUser._id],
      title: `Quotation ${status === 'shortlisted' ? 'Shortlisted' : 'Rejected'}`,
      message: `Your quotation ${quotation.quotationNumber} for ${quotation.rfq.rfqNumber} has been ${status}.`,
      type: status === 'shortlisted' ? 'quotation_shortlisted' : 'quotation_rejected',
      relatedModel: 'Quotation',
      relatedId: quotation._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: `QUOTATION_${status.toUpperCase()}`,
    module: 'Quotation',
    description: `Quotation ${quotation.quotationNumber} ${status}`,
    relatedModel: 'Quotation',
    relatedId: quotation._id,
  });

  res.status(200).json({ success: true, data: quotation });
});

// @desc    Withdraw a quotation (vendor only)
// @route   PATCH /api/quotations/:id/withdraw
// @access  Private (vendor)
exports.withdrawQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  if (quotation.vendor.toString() !== req.user.vendorProfile?.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (!['submitted', 'under_review'].includes(quotation.status)) {
    return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage.' });
  }

  quotation.status = 'withdrawn';
  await quotation.save();

  res.status(200).json({ success: true, data: quotation });
});