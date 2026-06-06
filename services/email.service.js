const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Initialize and cache the Nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Core send function
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  const transport = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "VendorBridge <noreply@vendorbridge.com>",
    to,
    subject,
    html,
    text,
    attachments,
  };

  const info = await transport.sendMail(mailOptions);

  if (process.env.NODE_ENV === "development") {
    console.log(`📧 Email sent to ${to} | MessageId: ${info.messageId}`);
  }

  return info;
};

// ─── Auth Email Templates ─────────────────────────────────────────────────────

/**
 * Send email verification link
 */
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: "VendorBridge – Verify Your Email Address",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#16a34a;margin:0;">VendorBridge</h1>
          <p style="color:#666;font-size:14px;margin:4px 0 0;">Procurement & Vendor Management ERP</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:6px;">
          <h2 style="color:#111;font-size:20px;">Welcome, ${user.firstName}!</h2>
          <p style="color:#444;line-height:1.6;">
            Thank you for registering with VendorBridge. Please verify your email address by clicking the button below.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verifyUrl}" 
               style="background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
          <p style="color:#aaa;font-size:12px;word-break:break-all;">Or copy: ${verifyUrl}</p>
        </div>
      </div>
    `,
    text: `Welcome to VendorBridge, ${user.firstName}!\n\nVerify your email: ${verifyUrl}\n\nExpires in 24 hours.`,
  });
};

/**
 * Send password reset link
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: "VendorBridge – Password Reset Request",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#16a34a;margin:0;">VendorBridge</h1>
          <p style="color:#666;font-size:14px;margin:4px 0 0;">Procurement & Vendor Management ERP</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:6px;">
          <h2 style="color:#111;font-size:20px;">Reset Your Password</h2>
          <p style="color:#444;line-height:1.6;">
            You requested a password reset. Click the button below to set a new password.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" 
               style="background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.</p>
          <p style="color:#aaa;font-size:12px;word-break:break-all;">Or copy: ${resetUrl}</p>
        </div>
      </div>
    `,
    text: `Password reset requested.\n\nReset link: ${resetUrl}\n\nExpires in 1 hour.`,
  });
};

/**
 * Send welcome email after successful verification
 */
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to VendorBridge!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#16a34a;margin:0;">VendorBridge</h1>
          <p style="color:#666;font-size:14px;margin:4px 0 0;">Procurement & Vendor Management ERP</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:6px;">
          <h2 style="color:#111;font-size:20px;">You're all set, ${user.firstName}!</h2>
          <p style="color:#444;line-height:1.6;">
            Your email has been verified. You can now log in and start using VendorBridge.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.CLIENT_URL}/login"
               style="background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
    text: `Welcome to VendorBridge, ${user.firstName}! Log in at: ${process.env.CLIENT_URL}/login`,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
