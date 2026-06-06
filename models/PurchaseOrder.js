const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number },
  hsnCode: { type: String }, // HSN/SAC code for GST
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
    },
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
    approval: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Approval',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [poItemSchema],
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    deliveryDate: { type: Date },
    paymentTerms: { type: String },
    subtotal: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    notes: { type: String },
    termsAndConditions: { type: String },
    status: {
      type: String,
      enum: ['generated', 'sent', 'acknowledged', 'fulfilled', 'cancelled'],
      default: 'generated',
    },
    sentAt: { type: Date },
    fulfilledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Auto-generate PO number
purchaseOrderSchema.pre('save', async function (next) {
  if (!this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    const year = new Date().getFullYear();
    this.poNumber = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Compute item totals
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return sum + item.totalPrice;
    }, 0);
    // Default: split tax equally between CGST and SGST (intra-state)
    this.cgst = +(this.subtotal * 0.09).toFixed(2);
    this.sgst = +(this.subtotal * 0.09).toFixed(2);
    this.igst = 0;
    this.totalTax = this.cgst + this.sgst + this.igst;
    this.totalAmount = +(this.subtotal + this.totalTax).toFixed(2);
  }

  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);