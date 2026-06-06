const PurchaseOrder = require('../models/PurchaseOrder');
const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');

// @desc    Generate Purchase Order from approved quotation
// @route   POST /api/purchase-orders
// @access  Private (procurement_officer, admin)
exports.generatePO = asyncHandler(async (req, res) => {
  const { approvalId, deliveryAddress, deliveryDate, paymentTerms, notes, termsAndConditions } = req.body;

  const approval = await Approval.findById(approvalId)
    .populate('quotation')
    .populate('rfq')
    .populate('vendor');

  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval not found.' });
  }

  if (approval.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Only approved requests can generate a PO.' });
  }

  // Check if PO already generated for this approval
  const existing = await PurchaseOrder.findOne({ approval: approvalId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'PO already generated for this approval.' });
  }

  const quotation = approval.quotation;
  const items = quotation.items.map((item) => ({
    itemName: item.itemName,
    description: item.specifications || '',
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    hsnCode: item.hsnCode || '',
  }));

  const po = await PurchaseOrder.create({
    rfq: approval.rfq._id,
    quotation: quotation._id,
    approval: approvalId,
    vendor: approval.vendor._id,
    createdBy: req.user._id,
    items,
    deliveryAddress,
    deliveryDate,
    paymentTerms: paymentTerms || quotation.paymentTerms,
    notes,
    termsAndConditions,
  });

  // Update vendor stats
  await Vendor.findByIdAndUpdate(approval.vendor._id, { $inc: { totalOrders: 1 } });

  // Notify vendor user
  const vendorUser = await User.findOne({ vendorProfile: approval.vendor._id });
  if (vendorUser) {
    await createNotification({
      recipients: [vendorUser._id],
      title: 'Purchase Order Generated',
      message: `A Purchase Order (${po.poNumber}) has been generated for you.`,
      type: 'po_generated',
      relatedModel: 'PurchaseOrder',
      relatedId: po._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: 'GENERATE_PO',
    module: 'PurchaseOrder',
    description: `PO generated: ${po.poNumber} for vendor ${approval.vendor.companyName}`,
    relatedModel: 'PurchaseOrder',
    relatedId: po._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: po });
});

// @desc    Get all Purchase Orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPOs = asyncHandler(async (req, res) => {
  const { status, vendorId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (vendorId) filter.vendor = vendorId;

  // Vendors only see their own POs
  if (req.user.role === 'vendor') {
    filter.vendor = req.user.vendorProfile;
  }

  const [pos, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('rfq', 'rfqNumber title')
      .populate('vendor', 'companyName email contactPerson')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    PurchaseOrder.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: pos.length,
    total,
    page: Number(page),
    data: pos,
  });
});

// @desc    Get single Purchase Order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPO = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id)
    .populate('rfq', 'rfqNumber title category description')
    .populate('quotation', 'quotationNumber')
    .populate('approval', 'status approvedAt')
    .populate('vendor', 'companyName email phone contactPerson gstNumber panNumber address bankDetails')
    .populate('createdBy', 'firstName lastName email');

  if (!po) {
    return res.status(404).json({ success: false, message: 'Purchase Order not found.' });
  }

  // Vendors can only see their own
  if (
    req.user.role === 'vendor' &&
    po.vendor._id.toString() !== req.user.vendorProfile?.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.status(200).json({ success: true, data: po });
});

// @desc    Update PO status (acknowledge, fulfil, cancel)
// @route   PATCH /api/purchase-orders/:id/status
// @access  Private
exports.updatePOStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['sent', 'acknowledged', 'fulfilled', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) {
    return res.status(404).json({ success: false, message: 'Purchase Order not found.' });
  }

  // Vendors can only acknowledge
  if (req.user.role === 'vendor' && status !== 'acknowledged') {
    return res.status(403).json({ success: false, message: 'Vendors can only acknowledge a PO.' });
  }

  po.status = status;
  if (status === 'sent') po.sentAt = Date.now();
  if (status === 'fulfilled') po.fulfilledAt = Date.now();
  await po.save();

  await logActivity({
    userId: req.user._id,
    action: `PO_${status.toUpperCase()}`,
    module: 'PurchaseOrder',
    description: `PO ${po.poNumber} status updated to ${status}`,
    relatedModel: 'PurchaseOrder',
    relatedId: po._id,
  });

  res.status(200).json({ success: true, data: po });
});