const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      enum: [
        'Auth',
        'Vendor',
        'RFQ',
        'Quotation',
        'Approval',
        'PurchaseOrder',
        'Invoice',
        'Notification',
        'Dashboard',
        'System',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedModel: { type: String, default: null },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);