const mongoose = require('mongoose');

const rfqItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pcs' },
  estimatedUnitPrice: { type: Number, default: 0 },
});

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'RFQ title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    items: {
      type: [rfqItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'At least one item is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    deliveryLocation: {
      type: String,
    },
    assignedVendors: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        invitedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['invited', 'viewed', 'responded', 'declined'],
          default: 'invited',
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'cancelled', 'awarded', 'open'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    closedAt: {
      type: Date,
    },
    awardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate RFQ number before save
rfqSchema.pre('save', async function (next) {
  if (!this.rfqNumber) {
    const count = await mongoose.model('RFQ').countDocuments();
    const year = new Date().getFullYear();
    this.rfqNumber = `RFQ-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

rfqSchema.index({ title: 'text', category: 'text' });

module.exports = mongoose.model('RFQ', rfqSchema);