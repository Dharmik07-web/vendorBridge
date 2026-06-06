const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQ,
  updateRFQ,
  publishRFQ,
  closeRFQ,
  cancelRFQ,
  addVendorsToRFQ,
} = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const rfqValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('deadline').isISO8601().withMessage('Valid deadline date required'),
];

router
  .route('/')
  .get(protect, getRFQs)
  .post(
    protect,
    authorize('admin', 'procurement_officer'),
    rfqValidation,
    validate,
    createRFQ
  );

router
  .route('/:id')
  .get(protect, getRFQ)
  .put(protect, authorize('admin', 'procurement_officer'), updateRFQ);

router.patch('/:id/publish', protect, authorize('admin', 'procurement_officer'), publishRFQ);
router.patch('/:id/close', protect, authorize('admin', 'procurement_officer'), closeRFQ);
router.patch('/:id/cancel', protect, authorize('admin'), cancelRFQ);
router.post('/:id/vendors', protect, authorize('admin', 'procurement_officer'), addVendorsToRFQ);

module.exports = router;