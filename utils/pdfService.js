const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a GST-compliant invoice PDF
 * @param {object} invoice - Populated Invoice document
 * @param {object} purchaseOrder - Populated PurchaseOrder document
 * @param {object} vendor - Vendor document
 * @param {object} organization - Organization info from env/config
 * @returns {Promise<string>} Path to generated PDF
 */
const generateInvoicePDF = (invoice, purchaseOrder, vendor) => {
  return new Promise((resolve, reject) => {
    const uploadDir = process.env.INVOICE_UPLOAD_PATH || './uploads/invoices';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const PRIMARY = '#1a7a3c';
    const DARK = '#1a1a1a';
    const GRAY = '#555555';
    const LIGHT_GRAY = '#f5f5f5';
    const WHITE = '#ffffff';

    // ─── Header Banner ────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
    doc.fill(WHITE).fontSize(26).font('Helvetica-Bold').text('VendorBridge', 50, 25);
    doc.fontSize(10).font('Helvetica').text('Procurement & Vendor Management ERP', 50, 58);
    doc.fill(WHITE).fontSize(22).font('Helvetica-Bold').text('TAX INVOICE', 0, 35, {
      align: 'right',
    });

    // ─── Invoice Info Box ─────────────────────────────────────────────────────
    doc.rect(50, 105, 240, 80).fill(LIGHT_GRAY).stroke('#cccccc');
    doc.fill(DARK).fontSize(9).font('Helvetica-Bold').text('INVOICE DETAILS', 60, 115);
    doc
      .font('Helvetica')
      .fill(GRAY)
      .text(`Invoice No: `, 60, 130)
      .fill(DARK)
      .text(invoice.invoiceNumber, 130, 130);
    doc
      .fill(GRAY)
      .text(`Invoice Date: `, 60, 145)
      .fill(DARK)
      .text(new Date(invoice.invoiceDate).toLocaleDateString('en-IN'), 130, 145);
    doc
      .fill(GRAY)
      .text(`Due Date: `, 60, 160)
      .fill(DARK)
      .text(
        invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString('en-IN')
          : 'On Delivery',
        130,
        160
      );
    doc
      .fill(GRAY)
      .text(`PO Number: `, 60, 175)
      .fill(DARK)
      .text(purchaseOrder.poNumber, 130, 175);

    // ─── Vendor Info Box ──────────────────────────────────────────────────────
    doc.rect(310, 105, 235, 80).fill(LIGHT_GRAY).stroke('#cccccc');
    doc.fill(DARK).fontSize(9).font('Helvetica-Bold').text('BILL TO / VENDOR', 320, 115);
    doc.font('Helvetica').fill(DARK).fontSize(9).text(vendor.companyName, 320, 130, { width: 210 });
    doc.fill(GRAY).text(vendor.email, 320, 145);
    doc.fill(GRAY).text(vendor.phone || '', 320, 160);
    if (vendor.gstNumber) {
      doc.fill(GRAY).text(`GSTIN: ${vendor.gstNumber}`, 320, 175);
    }

    // ─── Items Table Header ───────────────────────────────────────────────────
    const tableTop = 205;
    doc.rect(50, tableTop, 495, 20).fill(PRIMARY);
    doc.fill(WHITE).fontSize(8).font('Helvetica-Bold');
    doc.text('#', 55, tableTop + 6);
    doc.text('Item Description', 75, tableTop + 6, { width: 185 });
    doc.text('HSN', 265, tableTop + 6, { width: 50 });
    doc.text('Qty', 315, tableTop + 6, { width: 40, align: 'center' });
    doc.text('Unit Price', 355, tableTop + 6, { width: 70, align: 'right' });
    doc.text('Total', 425, tableTop + 6, { width: 70, align: 'right' });
    doc.text('Status', 500, tableTop + 6, { width: 45, align: 'right' });

    // ─── Items Table Rows ─────────────────────────────────────────────────────
    let y = tableTop + 20;
    invoice.items.forEach((item, idx) => {
      const rowBg = idx % 2 === 0 ? WHITE : '#f0f7f3';
      const rowHeight = 22;
      doc.rect(50, y, 495, rowHeight).fill(rowBg);
      doc.fill(DARK).font('Helvetica').fontSize(8);
      doc.text(String(idx + 1), 55, y + 7);
      doc.text(item.itemName, 75, y + 7, { width: 185 });
      doc.text(item.hsnCode || '-', 265, y + 7, { width: 50 });
      doc.text(`${item.quantity} ${item.unit}`, 315, y + 7, { width: 40, align: 'center' });
      doc.text(
        `₹${Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        355,
        y + 7,
        { width: 70, align: 'right' }
      );
      doc.text(
        `₹${Number(item.quantity * item.unitPrice).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}`,
        425,
        y + 7,
        { width: 70, align: 'right' }
      );
      y += rowHeight;
    });

    // ─── Totals Section ───────────────────────────────────────────────────────
    y += 10;
    const totalsX = 350;
    const valueX = 495;

    const addTotalRow = (label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fill(bold ? DARK : GRAY).fontSize(9);
      doc.text(label, totalsX, y, { width: 140 });
      doc.text(
        `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        valueX,
        y,
        { align: 'right', width: 50 }
      );
      y += 16;
    };

    doc.moveTo(350, y).lineTo(545, y).stroke('#cccccc');
    y += 5;
    addTotalRow('Subtotal:', invoice.subtotal);
    if (invoice.cgst > 0) addTotalRow('CGST (9%):', invoice.cgst);
    if (invoice.sgst > 0) addTotalRow('SGST (9%):', invoice.sgst);
    if (invoice.igst > 0) addTotalRow('IGST (18%):', invoice.igst);
    addTotalRow('Tax Total:', invoice.totalTax);

    // Grand total highlighted
    doc.rect(350, y, 195, 22).fill(PRIMARY);
    doc.fill(WHITE).font('Helvetica-Bold').fontSize(11);
    doc.text('GRAND TOTAL:', totalsX, y + 5, { width: 140 });
    doc.text(
      `₹${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      valueX,
      y + 5,
      { align: 'right', width: 50 }
    );
    y += 35;

    // ─── Payment Status Badge ─────────────────────────────────────────────────
    const statusColors = {
      paid: '#1a7a3c',
      unpaid: '#c0392b',
      partial: '#e67e22',
      overdue: '#8e44ad',
    };
    const statusColor = statusColors[invoice.paymentStatus] || GRAY;
    doc.rect(50, y, 100, 20).fill(statusColor);
    doc
      .fill(WHITE)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 55, y + 6, { width: 90 });
    y += 35;

    // ─── Notes ────────────────────────────────────────────────────────────────
    if (invoice.notes) {
      doc.fill(DARK).font('Helvetica-Bold').fontSize(9).text('Notes:', 50, y);
      doc.fill(GRAY).font('Helvetica').fontSize(8).text(invoice.notes, 50, y + 12, { width: 495 });
      y += 30;
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc.rect(0, footerY, doc.page.width, 60).fill(PRIMARY);
    doc.fill(WHITE).font('Helvetica').fontSize(8);
    doc.text('This is a computer-generated invoice. No signature required.', 50, footerY + 15, {
      align: 'center',
      width: doc.page.width - 100,
    });
    doc.text(
      `Generated by VendorBridge ERP | ${new Date().toLocaleString('en-IN')}`,
      50,
      footerY + 32,
      { align: 'center', width: doc.page.width - 100 }
    );

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };