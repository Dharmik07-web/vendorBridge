const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');
const { sendRFQInvitation } = require('../utils/emailService');

// @desc    Create RFQ
// @route   POST /api/rfqs
// @access  Private (procurement_officer, admin)
exports.createRFQ = asyncHandler(async (req, res) => {
  const { title, description, category, items, deadline, deliveryLocation, vendorIds } = req.body;

  const assignedVendors = [];
  if (vendorIds && vendorIds.length > 0) {
    vendorIds.forEach((vid) => assignedVendors.push({ vendor: vid, status: 'invited' }));
  }

  const rfq = await RFQ.create({
    title,
    description,
    category,
    items,
    deadline,
    deliveryLocation,
    assignedVendors,
    createdBy: req.user._id,
    status: 'draft',
  });

  await logActivity({
    userId: req.user._id,
    action: 'CREATE_RFQ',
    module: 'RFQ',
    description: `RFQ created: ${rfq.rfqNumber} - ${rfq.title}`,
    relatedModel: 'RFQ',
    relatedId: rfq._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: rfq });
});

// @desc    Get all RFQs
// @route   GET /api/rfqs
// @access  Private
exports.getRFQs = asyncHandler(async (req, res) => {
  const {
    status, category, search, page = 1, limit = 20,
    sortBy = 'createdAt', order = 'desc',
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { rfqNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Vendors only see RFQs assigned to them
  if (req.user.role === 'vendor') {
    filter['assignedVendors.vendor'] = req.user.vendorProfile;
    filter.status = { $in: ['published', 'closed', 'awarded'] };
  }

  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

  const [rfqs, total] = await Promise.all([
    RFQ.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedVendors.vendor', 'companyName email')
      .populate('awardedTo', 'companyName email')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    RFQ.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: rfqs.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: rfqs,
  });
});

// @desc    Get single RFQ
// @route   GET /api/rfqs/:id
// @access  Private
exports.getRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedVendors.vendor', 'companyName email phone contactPerson')
    .populate('awardedTo', 'companyName email');

  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  res.status(200).json({ success: true, data: rfq });
});

// @desc    Update RFQ
// @route   PUT /api/rfqs/:id
// @access  Private (procurement_officer, admin)
exports.updateRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id);
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  if (rfq.status !== 'draft') {
    return res.status(400).json({ success: false, message: 'Only draft RFQs can be edited.' });
  }

  const updated = await RFQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logActivity({
    userId: req.user._id,
    action: 'UPDATE_RFQ',
    module: 'RFQ',
    description: `RFQ updated: ${rfq.rfqNumber}`,
    relatedModel: 'RFQ',
    relatedId: rfq._id,
  });

  res.status(200).json({ success: true, data: updated });
});

// @desc    Publish RFQ and invite vendors
// @route   PATCH /api/rfqs/:id/publish
// @access  Private (procurement_officer, admin)
exports.publishRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id).populate(
    'assignedVendors.vendor',
    'companyName email contactPerson'
  );

  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  if (rfq.status !== 'draft') {
    return res.status(400).json({ success: false, message: 'Only draft RFQs can be published.' });
  }

  rfq.status = 'published';
  await rfq.save();

  // Send email invitations to all assigned vendors
  const emailPromises = rfq.assignedVendors.map(async ({ vendor }) => {
    if (vendor && vendor.email) {
      try {
        await sendRFQInvitation({
          vendorEmail: vendor.email,
          vendorName: vendor.companyName,
          rfq,
        });
      } catch (e) {
        console.error(`Failed to send RFQ email to ${vendor.email}:`, e.message);
      }
    }
  });
  await Promise.allSettled(emailPromises);

  // Find vendor user accounts to notify in-app
  const vendorUserIds = await User.find({
    vendorProfile: { $in: rfq.assignedVendors.map((av) => av.vendor._id) },
  }).select('_id');

  if (vendorUserIds.length) {
    await createNotification({
      recipients: vendorUserIds.map((u) => u._id),
      title: 'New RFQ Invitation',
      message: `You have been invited to submit a quotation for: ${rfq.rfqNumber} - ${rfq.title}`,
      type: 'rfq_published',
      relatedModel: 'RFQ',
      relatedId: rfq._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: 'PUBLISH_RFQ',
    module: 'RFQ',
    description: `RFQ published and vendors invited: ${rfq.rfqNumber}`,
    relatedModel: 'RFQ',
    relatedId: rfq._id,
  });

  res.status(200).json({ success: true, data: rfq, message: 'RFQ published and vendors notified.' });
});

// @desc    Close RFQ
// @route   PATCH /api/rfqs/:id/close
// @access  Private (procurement_officer, admin)
exports.closeRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id);
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  rfq.status = 'closed';
  rfq.closedAt = Date.now();
  await rfq.save();

  await logActivity({
    userId: req.user._id,
    action: 'CLOSE_RFQ',
    module: 'RFQ',
    description: `RFQ closed: ${rfq.rfqNumber}`,
    relatedModel: 'RFQ',
    relatedId: rfq._id,
  });

  res.status(200).json({ success: true, data: rfq });
});

// @desc    Cancel RFQ
// @route   PATCH /api/rfqs/:id/cancel
// @access  Private (admin)
exports.cancelRFQ = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  await logActivity({
    userId: req.user._id,
    action: 'CANCEL_RFQ',
    module: 'RFQ',
    description: `RFQ cancelled: ${rfq.rfqNumber}`,
    relatedModel: 'RFQ',
    relatedId: rfq._id,
  });

  res.status(200).json({ success: true, data: rfq });
});

// @desc    Add vendors to existing RFQ
// @route   POST /api/rfqs/:id/vendors
// @access  Private (procurement_officer, admin)
exports.addVendorsToRFQ = asyncHandler(async (req, res) => {
  const { vendorIds } = req.body;
  const rfq = await RFQ.findById(req.params.id);
  if (!rfq) {
    return res.status(404).json({ success: false, message: 'RFQ not found.' });
  }

  const existingVendorIds = rfq.assignedVendors.map((av) => av.vendor.toString());
  const newVendors = vendorIds
    .filter((id) => !existingVendorIds.includes(id))
    .map((id) => ({ vendor: id, status: 'invited' }));

  rfq.assignedVendors.push(...newVendors);
  await rfq.save();

  res.status(200).json({ success: true, data: rfq, message: `${newVendors.length} vendor(s) added.` });
});