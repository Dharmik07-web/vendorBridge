const express = require('express');
const router = express.Router();
const {
  submitQuotation,
  getQuotations,
  getQuotation,
  compareQuotations,
  reviewQuotation,
  withdrawQuotation,
} = require('../controllers/Quotationcontroller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Quotation validation
const quotationValidation = [
  body('rfqId').notEmpty().withMessage('RFQ ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('deliveryTimeline').notEmpty().withMessage('Delivery timeline is required'),
];

// @route   GET /api/v1/quotations
// @desc    Get all quotations with filtering
// @access  Private
router.get('/', protect, getQuotations);

// @route   GET /api/v1/quotations/compare/:rfqId
// @desc    Compare quotations for an RFQ
// @access  Private (procurement_officer, manager, admin)
router.get('/compare/:rfqId', protect, authorize('admin', 'procurement_officer', 'manager'), compareQuotations);

// @route   POST /api/v1/quotations
// @desc    Submit a new quotation
// @access  Private (vendor)
router.post(
  '/',
  protect,
  authorize('vendor'),
  quotationValidation,
  validate,
  submitQuotation
);

// @route   GET /api/v1/quotations/:id
// @desc    Get single quotation
// @access  Private
router.get('/:id', protect, getQuotation);

// @route   PUT /api/v1/quotations/:id
// @desc    Review quotation (accept/reject)
// @access  Private (procurement_officer, admin)
router.put(
  '/:id',
  protect,
  authorize('admin', 'procurement_officer'),
  [body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')],
  validate,
  reviewQuotation
);

// @route   DELETE /api/v1/quotations/:id
// @desc    Withdraw quotation
// @access  Private (vendor)
router.delete('/:id', protect, authorize('vendor'), withdrawQuotation);

module.exports = router;
