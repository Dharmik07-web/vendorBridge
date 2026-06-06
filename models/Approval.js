const mongoose = require('mongoose');

const approvalStepSchema = new mongoose.Schema({
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  remarks: { type: String },
  actionAt: { type: Date },
  order: { type: Number, required: true }, // step order in workflow
});

const approvalSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    steps: [approvalStepSchema],
    currentStep: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    finalRemarks: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    totalAmount: { type: Number }, // snapshot of approved amount
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Approval', approvalSchema);