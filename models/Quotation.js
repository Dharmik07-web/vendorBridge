const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number },
  brand: { type: String },
  specifications: { type: String },
});

quotationItemSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    items: {
      type: [quotationItemSchema],
      required: true,
    },
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 }, // GST %
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    deliveryTimeline: {
      type: Number, // in days
      required: [true, 'Delivery timeline is required'],
    },
    deliveryTerms: { type: String },
    paymentTerms: { type: String },
    warranty: { type: String },
    validUntil: { type: Date },
    notes: { type: String },
    attachments: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'rejected', 'approved', 'withdrawn'],
      default: 'submitted',
    },
    isLowestPrice: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Auto-generate quotation number and compute totals
quotationSchema.pre('save', async function (next) {
  // Generate number
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    const year = new Date().getFullYear();
    this.quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Compute totals from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      item.totalPrice = itemTotal;
      return sum + itemTotal;
    }, 0);
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    this.totalAmount = this.subtotal + this.taxAmount;
  }

  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);