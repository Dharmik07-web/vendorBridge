const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadPhoto } = require('../middleware/upload');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Public routes
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'procurement_officer', 'manager', 'vendor'])
      .withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadPhoto.single('photo'), updateProfile);
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

// Admin only
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;