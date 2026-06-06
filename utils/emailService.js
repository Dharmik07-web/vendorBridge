const transporter = require('../config/email');
const fs = require('fs');

/**
 * Send a generic email
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
    attachments,
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send RFQ invitation email to vendor
 */
const sendRFQInvitation = async ({ vendorEmail, vendorName, rfq }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a7a3c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">VendorBridge</h1>
        <p style="color: #d4edda; margin: 5px 0;">Procurement & Vendor Management ERP</p>
      </div>
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e0e0e0;">
        <h2 style="color: #1a7a3c;">New RFQ Invitation</h2>
        <p>Dear <strong>${vendorName}</strong>,</p>
        <p>You have been invited to submit a quotation for the following Request for Quotation:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>RFQ Number</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${rfq.rfqNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Title</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${rfq.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Category</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${rfq.category}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Deadline</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(rfq.deadline).toLocaleDateString('en-IN')}</td>
          </tr>
        </table>
        <p>Please log in to the VendorBridge portal to view the full RFQ details and submit your quotation before the deadline.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/rfq/${rfq._id}" 
             style="background: #1a7a3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            View RFQ & Submit Quotation
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">If you have any questions, please contact the procurement team.</p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        <p>© ${new Date().getFullYear()} VendorBridge ERP. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: vendorEmail,
    subject: `[VendorBridge] RFQ Invitation: ${rfq.rfqNumber} - ${rfq.title}`,
    html,
  });
};

/**
 * Send approval result notification
 */
const sendApprovalEmail = async ({ to, name, rfqTitle, status, remarks }) => {
  const color = status === 'approved' ? '#1a7a3c' : '#c0392b';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a7a3c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">VendorBridge</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: ${color};">Approval ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your procurement request for <strong>${rfqTitle}</strong> has been 
           <strong style="color: ${color};">${status}</strong>.</p>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/approvals"
             style="background: #1a7a3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px;">
            View in Portal
          </a>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        <p>© ${new Date().getFullYear()} VendorBridge ERP</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `[VendorBridge] Procurement ${status}: ${rfqTitle}`,
    html,
  });
};

/**
 * Send invoice via email with PDF attachment
 */
const sendInvoiceEmail = async ({ to, invoiceNumber, poNumber, totalAmount, pdfPath, vendorName }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a7a3c; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">VendorBridge</h1>
        <p style="color: #d4edda; margin: 5px 0;">Tax Invoice</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1a7a3c;">Invoice ${invoiceNumber}</h2>
        <p>Dear <strong>${vendorName}</strong>,</p>
        <p>Please find attached the tax invoice for your reference.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Invoice Number</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>PO Number</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${poNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Total Amount</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #1a7a3c;">
              ₹${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </table>
        <p style="color: #888; font-size: 12px;">This is a computer-generated invoice. Please do not reply to this email.</p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        <p>© ${new Date().getFullYear()} VendorBridge ERP</p>
      </div>
    </div>
  `;

  const attachments = [];
  if (pdfPath) {
    attachments.push({
      filename: `${invoiceNumber}.pdf`,
      path: pdfPath,
      contentType: 'application/pdf',
    });
  }

  return sendEmail({
    to,
    subject: `[VendorBridge] Invoice ${invoiceNumber} | PO: ${poNumber}`,
    html,
    attachments,
  });
};

module.exports = { sendEmail, sendRFQInvitation, sendApprovalEmail, sendInvoiceEmail };