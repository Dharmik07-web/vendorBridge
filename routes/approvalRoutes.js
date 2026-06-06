const express = require('express');
const router = express.Router();
const {
  initiateApproval,
  getApprovals,
  getApproval,
  processApproval,
  cancelApproval,
} = require('../controllers/Approvalcontroller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Approval validation
const approvalValidation = [
  body('quotationId').notEmpty().withMessage('Quotation ID is required'),
  body('approvers').isArray({ min: 1 }).withMessage('At least one approver required'),
];

const processValidation = [
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('remarks').notEmpty().withMessage('Remarks are required'),
];

// @route   GET /api/v1/approvals
// @desc    Get all approvals (pending, completed)
// @access  Private (manager, admin)
router.get(
  '/',
  protect,
  authorize('admin', 'manager'),
  getApprovals
);

// @route   POST /api/v1/approvals
// @desc    Initiate approval workflow
// @access  Private (procurement_officer, admin)
router.post(
  '/',
  protect,
  authorize('admin', 'procurement_officer'),
  approvalValidation,
  validate,
  initiateApproval
);

// @route   GET /api/v1/approvals/:id
// @desc    Get single approval
// @access  Private (manager, admin)
router.get(
  '/:id',
  protect,
  authorize('admin', 'manager'),
  getApproval
);

// @route   PUT /api/v1/approvals/:id
// @desc    Process approval (approve/reject)
// @access  Private (manager, admin)
router.put(
  '/:id',
  protect,
  authorize('admin', 'manager'),
  processValidation,
  validate,
  processApproval
);

// @route   DELETE /api/v1/approvals/:id
// @desc    Cancel approval workflow
// @access  Private (admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  cancelApproval
);

module.exports = router;
