const express = require('express');
const router = express.Router();
const {
  generatePO,
  getPOs,
  getPO,
  updatePOStatus,
} = require('../controllers/Purchaseordercontroller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// PO validation
const poValidation = [
  body('quotationId').notEmpty().withMessage('Quotation ID is required'),
  body('poDate').optional().isISO8601().withMessage('Invalid PO date'),
];

const statusValidation = [
  body('status').isIn(['draft', 'confirmed', 'partially_received', 'received', 'cancelled']).withMessage('Invalid status'),
];

// @route   GET /api/v1/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get('/', protect, getPOs);

// @route   POST /api/v1/purchase-orders
// @desc    Generate purchase order from approved quotation
// @access  Private (procurement_officer, admin)
router.post(
  '/',
  protect,
  authorize('admin', 'procurement_officer'),
  poValidation,
  validate,
  generatePO
);

// @route   GET /api/v1/purchase-orders/:id
// @desc    Get single purchase order
// @access  Private
router.get('/:id', protect, getPO);

// @route   PATCH /api/v1/purchase-orders/:id/status
// @desc    Update PO status
// @access  Private (procurement_officer, admin)
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'procurement_officer'),
  statusValidation,
  validate,
  updatePOStatus
);

module.exports = router;
