const express = require('express');
const router = express.Router();
const {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  getCategories,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const vendorValidation = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('category').isArray({ min: 1 }).withMessage('At least one category required'),
];

router.get('/categories', protect, getCategories);

router
  .route('/')
  .get(protect, getVendors)
  .post(protect, authorize('admin', 'procurement_officer'), vendorValidation, validate, createVendor);

router
  .route('/:id')
  .get(protect, getVendor)
  .put(protect, authorize('admin', 'procurement_officer'), updateVendor)
  .delete(protect, authorize('admin'), deleteVendor);

router.patch('/:id/status', protect, authorize('admin'), updateVendorStatus);

module.exports = router;