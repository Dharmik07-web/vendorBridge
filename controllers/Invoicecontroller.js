const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');
const { generateInvoicePDF } = require('../utils/pdfService');
const { sendInvoiceEmail } = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

// @desc    Generate invoice from PO
// @route   POST /api/invoices
// @access  Private (procurement_officer, admin)
exports.generateInvoice = asyncHandler(async (req, res) => {
  const { purchaseOrderId, dueDate, notes } = req.body;

  const po = await PurchaseOrder.findById(purchaseOrderId)
    .populate('vendor', 'companyName email phone contactPerson gstNumber address')
    .populate('rfq', 'rfqNumber title')
    .populate('createdBy', 'firstName lastName email');

  if (!po) {
    return res.status(404).json({ success: false, message: 'Purchase Order not found.' });
  }

  if (['cancelled'].includes(po.status)) {
    return res.status(400).json({ success: false, message: 'Cannot generate invoice for cancelled PO.' });
  }

  // Check if invoice already exists
  const existing = await Invoice.findOne({ purchaseOrder: purchaseOrderId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Invoice already generated for this PO.' });
  }

  const invoice = await Invoice.create({
    purchaseOrder: purchaseOrderId,
    vendor: po.vendor._id,
    generatedBy: req.user._id,
    dueDate,
    notes,
    items: po.items,
    subtotal: po.subtotal,
    cgst: po.cgst,
    sgst: po.sgst,
    igst: po.igst,
    totalTax: po.totalTax,
    totalAmount: po.totalAmount,
  });

  // Generate PDF
  try {
    const populatedInvoice = await Invoice.findById(invoice._id);
    const pdfPath = await generateInvoicePDF(populatedInvoice, po, po.vendor);
    invoice.pdfPath = pdfPath;
    await invoice.save();
  } catch (pdfErr) {
    console.error('PDF generation error:', pdfErr.message);
    // Invoice is created even if PDF fails — can retry
  }

  // Notify vendor user
  const vendorUser = await User.findOne({ vendorProfile: po.vendor._id });
  if (vendorUser) {
    await createNotification({
      recipients: [vendorUser._id],
      title: 'Invoice Generated',
      message: `Invoice ${invoice.invoiceNumber} has been generated for PO ${po.poNumber}.`,
      type: 'invoice_generated',
      relatedModel: 'Invoice',
      relatedId: invoice._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: 'GENERATE_INVOICE',
    module: 'Invoice',
    description: `Invoice generated: ${invoice.invoiceNumber} for PO ${po.poNumber}`,
    relatedModel: 'Invoice',
    relatedId: invoice._id,
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, data: invoice });
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res) => {
  const { paymentStatus, vendorId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (vendorId) filter.vendor = vendorId;

  if (req.user.role === 'vendor') {
    filter.vendor = req.user.vendorProfile;
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('purchaseOrder', 'poNumber')
      .populate('vendor', 'companyName email')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Invoice.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: invoices.length, total, page: Number(page), data: invoices });
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('purchaseOrder', 'poNumber deliveryAddress paymentTerms termsAndConditions')
    .populate('vendor', 'companyName email phone contactPerson gstNumber panNumber address bankDetails')
    .populate('generatedBy', 'firstName lastName email');

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  if (
    req.user.role === 'vendor' &&
    invoice.vendor._id.toString() !== req.user.vendorProfile?.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.status(200).json({ success: true, data: invoice });
});

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/download
// @access  Private
exports.downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('purchaseOrder')
    .populate('vendor');

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  // Re-generate PDF if missing
  if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
    const po = await PurchaseOrder.findById(invoice.purchaseOrder).populate('vendor');
    const pdfPath = await generateInvoicePDF(invoice, po, po.vendor);
    invoice.pdfPath = pdfPath;
    await invoice.save();
  }

  await logActivity({
    userId: req.user._id,
    action: 'DOWNLOAD_INVOICE',
    module: 'Invoice',
    description: `Invoice downloaded: ${invoice.invoiceNumber}`,
    relatedModel: 'Invoice',
    relatedId: invoice._id,
  });

  res.download(invoice.pdfPath, `${invoice.invoiceNumber}.pdf`);
});

// @desc    Send invoice via email
// @route   POST /api/invoices/:id/send-email
// @access  Private (procurement_officer, admin)
exports.sendInvoiceByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body; // override email, else use vendor email

  const invoice = await Invoice.findById(req.params.id)
    .populate('purchaseOrder', 'poNumber')
    .populate('vendor', 'companyName email');

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  const recipientEmail = email || invoice.vendor.email;

  // Re-generate PDF if missing
  if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
    const po = await PurchaseOrder.findById(invoice.purchaseOrder._id).populate('vendor');
    const pdfPath = await generateInvoicePDF(invoice, po, po.vendor);
    invoice.pdfPath = pdfPath;
    await invoice.save();
  }

  await sendInvoiceEmail({
    to: recipientEmail,
    invoiceNumber: invoice.invoiceNumber,
    poNumber: invoice.purchaseOrder.poNumber,
    totalAmount: invoice.totalAmount,
    pdfPath: invoice.pdfPath,
    vendorName: invoice.vendor.companyName,
  });

  invoice.emailSentAt = Date.now();
  invoice.emailSentTo = recipientEmail;
  await invoice.save();

  // Notify vendor user
  const vendorUser = await User.findOne({ vendorProfile: invoice.vendor._id });
  if (vendorUser) {
    await createNotification({
      recipients: [vendorUser._id],
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoiceNumber} has been sent to ${recipientEmail}.`,
      type: 'invoice_sent',
      relatedModel: 'Invoice',
      relatedId: invoice._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: 'SEND_INVOICE_EMAIL',
    module: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} emailed to ${recipientEmail}`,
    relatedModel: 'Invoice',
    relatedId: invoice._id,
  });

  res.status(200).json({ success: true, message: `Invoice sent to ${recipientEmail}.`, data: invoice });
});

// @desc    Update payment status
// @route   PATCH /api/invoices/:id/payment-status
// @access  Private (admin, procurement_officer)
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, paymentDate } = req.body;
  const valid = ['unpaid', 'partial', 'paid', 'overdue'];
  if (!valid.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
  }

  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { paymentStatus, paymentDate: paymentDate || Date.now() },
    { new: true }
  );

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  await logActivity({
    userId: req.user._id,
    action: 'UPDATE_PAYMENT_STATUS',
    module: 'Invoice',
    description: `Invoice ${invoice.invoiceNumber} payment status set to ${paymentStatus}`,
    relatedModel: 'Invoice',
    relatedId: invoice._id,
  });

  res.status(200).json({ success: true, data: invoice });
});