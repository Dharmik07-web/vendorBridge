const express = require('express');
const router = express.Router();
const {
  generateInvoice,
  getInvoices,
  getInvoice,
  downloadInvoice,
  sendInvoiceByEmail,
  updatePaymentStatus,
} = require('../controllers/Invoicecontroller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Invoice validation
const invoiceValidation = [
  body('purchaseOrderId').notEmpty().withMessage('Purchase Order ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
];

const paymentValidation = [
  body('status').isIn(['pending', 'partial', 'paid']).withMessage('Invalid payment status'),
];

// @route   GET /api/v1/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', protect, getInvoices);

// @route   POST /api/v1/invoices
// @desc    Generate invoice from purchase order
// @access  Private (procurement_officer, admin)
router.post(
  '/',
  protect,
  authorize('admin', 'procurement_officer'),
  invoiceValidation,
  validate,
  generateInvoice
);

// @route   GET /api/v1/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, getInvoice);

// @route   GET /api/v1/invoices/:id/download
// @desc    Download invoice as PDF
// @access  Private
router.get('/:id/download', protect, downloadInvoice);

// @route   POST /api/v1/invoices/:id/send-email
// @desc    Send invoice via email
// @access  Private (procurement_officer, admin)
router.post(
  '/:id/send-email',
  protect,
  authorize('admin', 'procurement_officer'),
  [body('recipientEmail').isEmail().withMessage('Valid email required')],
  validate,
  sendInvoiceByEmail
);

// @route   PATCH /api/v1/invoices/:id/payment-status
// @desc    Update invoice payment status
// @access  Private (admin)
router.patch(
  '/:id/payment-status',
  protect,
  authorize('admin'),
  paymentValidation,
  validate,
  updatePaymentStatus
);

module.exports = router;
