const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    category: {
      type: [String],
      enum: [
        'IT Hardware',
        'IT Software',
        'Office Supplies',
        'Furniture',
        'Logistics',
        'Stationery',
        'Maintenance',
        'Catering',
        'Consulting',
        'Other',
        'electronics',
        'machinery',
        'raw materials',
        'services',
      ],
      required: [true, 'At least one category is required'],
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolder: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blacklisted', 'pending'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    // Linked user account (for vendor login)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
vendorSchema.index({ companyName: 'text', email: 'text', category: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);