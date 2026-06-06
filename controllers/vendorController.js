const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');

// @desc    Create / register a vendor
// @route   POST /api/vendors
// @access  Private (admin, procurement_officer)
exports.createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create({ ...req.body, registeredBy: req.user._id });

  // If a user account is being linked or created for this vendor
  // (handled separately via /api/vendors/:id/link-user)

  await logActivity({
    userId: req.user._id,
    action: 'CREATE_VENDOR',
    module: 'Vendor',
    description: `Vendor registered: ${vendor.companyName}`,
    relatedModel: 'Vendor',
    relatedId: vendor._id,
    ipAddress: req.ip,
  });

  // Notify admins
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (admins.length) {
    await createNotification({
      recipients: admins.map((a) => a._id),
      title: 'New Vendor Registered',
      message: `${vendor.companyName} has been registered as a vendor.`,
      type: 'vendor_registered',
      relatedModel: 'Vendor',
      relatedId: vendor._id,
    });
  }

  res.status(201).json({ success: true, data: vendor });
});

// @desc    Get all vendors with search & filter
// @route   GET /api/vendors
// @access  Private
exports.getVendors = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = { $in: [category] };
  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];
  }

  // Vendors can only see their own profile
  if (req.user.role === 'vendor') {
    filter._id = req.user.vendorProfile;
  }

  const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate('registeredBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Vendor.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: vendors.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: vendors,
  });
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('registeredBy', 'firstName lastName email')
    .populate('user', 'firstName lastName email role');

  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found.' });
  }

  // Vendors can only view their own profile
  if (
    req.user.role === 'vendor' &&
    vendor._id.toString() !== req.user.vendorProfile?.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.status(200).json({ success: true, data: vendor });
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (admin, procurement_officer)
exports.updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found.' });
  }

  await logActivity({
    userId: req.user._id,
    action: 'UPDATE_VENDOR',
    module: 'Vendor',
    description: `Vendor updated: ${vendor.companyName}`,
    relatedModel: 'Vendor',
    relatedId: vendor._id,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, data: vendor });
});

// @desc    Update vendor status
// @route   PATCH /api/vendors/:id/status
// @access  Private (admin)
exports.updateVendorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive', 'blacklisted', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found.' });
  }

  await logActivity({
    userId: req.user._id,
    action: 'UPDATE_VENDOR_STATUS',
    module: 'Vendor',
    description: `Vendor ${vendor.companyName} status changed to ${status}`,
    relatedModel: 'Vendor',
    relatedId: vendor._id,
  });

  res.status(200).json({ success: true, data: vendor });
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (admin)
exports.deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found.' });
  }

  await logActivity({
    userId: req.user._id,
    action: 'DELETE_VENDOR',
    module: 'Vendor',
    description: `Vendor deleted: ${vendor.companyName}`,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Vendor deleted successfully.' });
});

// @desc    Get vendor categories list
// @route   GET /api/vendors/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = [
    'IT Hardware', 'IT Software', 'Office Supplies', 'Furniture',
    'Logistics', 'Stationery', 'Maintenance', 'Catering', 'Consulting', 'Other',
  ];
  res.status(200).json({ success: true, data: categories });
});