const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, phone, country, additionalInfo } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'procurement_officer',
    phone,
    country,
    additionalInfo,
  });

  await logActivity({
    userId: user._id,
    action: 'REGISTER',
    module: 'Auth',
    description: `New user registered: ${user.email} as ${user.role}`,
    ipAddress: req.ip,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated.' });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await logActivity({
    userId: user._id,
    action: 'LOGIN',
    module: 'Auth',
    description: `User logged in: ${user.email}`,
    ipAddress: req.ip,
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('vendorProfile');
  res.status(200).json({ success: true, data: user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'country', 'additionalInfo'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.file) {
    updates.photo = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await logActivity({
    userId: req.user._id,
    action: 'UPDATE_PROFILE',
    module: 'Auth',
    description: 'User updated profile',
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  await logActivity({
    userId: req.user._id,
    action: 'CHANGE_PASSWORD',
    module: 'Auth',
    description: 'User changed password',
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Password updated successfully.' });
});

// @desc    Admin: Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    data: users,
  });
});

// @desc    Admin: Toggle user active status
// @route   PUT /api/auth/users/:id/toggle
// @access  Private/Admin
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    userId: req.user._id,
    action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    module: 'Auth',
    description: `Admin ${user.isActive ? 'activated' : 'deactivated'} user ${user.email}`,
    relatedModel: 'User',
    relatedId: user._id,
  });

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    data: user,
  });
});