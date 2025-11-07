const nodemailer = require('nodemailer');

/**
 * Email Service using Brevo (formerly Sendinblue)
 */

// Create transporter using Brevo SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.BREVO_SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP username
      pass: process.env.BREVO_SMTP_KEY    // Your Brevo SMTP key
    }
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @param {Array} options.attachments - Email attachments
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.BREVO_FROM_EMAIL || 'noreply@funnytourism.com',
      fromName: process.env.BREVO_FROM_NAME || 'Funny Tourism',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Send voucher email
 */
exports.sendVoucherEmail = async (to, bookingCode, voucherPaths) => {
  try {
    const attachments = voucherPaths.map(path => ({
      filename: path.split('/').pop(),
      path: path
    }));

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h2 style="color: #333;">Funny Tourism - Vouchers</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear Valued Partner,</p>
          <p>Please find attached the vouchers for booking <strong>${bookingCode}</strong>.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Funny Tourism Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: `Vouchers for Booking ${bookingCode}`,
      html,
      attachments
    });
  } catch (error) {
    console.error('Error sending voucher email:', error);
    throw error;
  }
};

/**
 * Send booking confirmation email
 */
exports.sendBookingConfirmation = async (to, bookingDetails) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h2 style="color: white;">Booking Confirmed!</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear ${bookingDetails.clientName},</p>
          <p>Your booking has been confirmed!</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p style="margin: 5px 0;"><strong>Booking Code:</strong> ${bookingDetails.bookingCode}</p>
            <p style="margin: 5px 0;"><strong>Travel Dates:</strong> ${bookingDetails.travelDates}</p>
            <p style="margin: 5px 0;"><strong>Passengers:</strong> ${bookingDetails.paxCount}</p>
          </div>
          <p>We will send you the detailed vouchers shortly.</p>
          <p>Thank you for choosing Funny Tourism!</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Funny Tourism Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>If you have any questions, please contact us at info@funnytourism.com</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: `Booking Confirmation - ${bookingDetails.bookingCode}`,
      html
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};

/**
 * Send payment reminder email
 */
exports.sendPaymentReminder = async (to, paymentDetails) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF9800; padding: 20px; text-align: center;">
          <h2 style="color: white;">Payment Reminder</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear ${paymentDetails.clientName},</p>
          <p>This is a friendly reminder that payment is due for your booking.</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #FF9800;">
            <p style="margin: 5px 0;"><strong>Booking Code:</strong> ${paymentDetails.bookingCode}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${paymentDetails.totalAmount}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${paymentDetails.amountPaid}</p>
            <p style="margin: 5px 0;"><strong>Outstanding:</strong> $${paymentDetails.outstanding}</p>
          </div>
          <p>Please arrange payment at your earliest convenience.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Funny Tourism Team</strong></p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>If you have any questions about payment, please contact us at accounts@funnytourism.com</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: `Payment Reminder - ${paymentDetails.bookingCode}`,
      html
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw error;
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
};
