const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'rfq_created',
        'rfq_published',
        'rfq_closed',
        'quotation_submitted',
        'quotation_shortlisted',
        'quotation_rejected',
        'approval_requested',
        'approval_approved',
        'approval_rejected',
        'po_generated',
        'po_sent',
        'invoice_generated',
        'invoice_sent',
        'vendor_registered',
        'general',
      ],
      default: 'general',
    },
    relatedModel: {
      type: String,
      enum: ['RFQ', 'Quotation', 'Approval', 'PurchaseOrder', 'Invoice', 'Vendor'],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast querying by recipient
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);