import nodemailer from 'nodemailer';

const FROM_EMAIL = process.env.EMAIL_FROM || 'MLA Sports <orders@mlasports.com>';

/**
 * Send email using Resend HTTP API
 */
const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Resend API error:', data);
      return null;
    }
    console.log(`[EmailService] Resend dispatched email to ${to}: ${data.id}`);
    return data;
  } catch (err) {
    console.warn('[EmailService] Resend send error:', err.message);
    return null;
  }
};

/**
 * Send email using SMTP (Nodemailer)
 */
const sendViaSMTP = async ({ to, subject, html }) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`[EmailService] SMTP sent email to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.warn('[EmailService] SMTP send error:', err.message);
    return null;
  }
};

/**
 * Generic dispatcher that prioritizes Resend, falls back to SMTP, 
 * and falls back to mock console logger with full receipt template.
 */
export const dispatchEmail = async ({ to, subject, html }) => {
  if (!to) return;

  // 1. Try Resend if API key is configured
  if (process.env.RESEND_API_KEY) {
    const resendResult = await sendViaResend({ to, subject, html });
    if (resendResult) return resendResult;
  }

  // 2. Try SMTP if configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const smtpResult = await sendViaSMTP({ to, subject, html });
    if (smtpResult) return smtpResult;
  }

  // 3. Graceful fallback logger: Always succeeds and prints to server logs
  console.log('====================================================');
  console.log(`[EMAIL DISPATCHED TO: ${to}]`);
  console.log(`Subject: ${subject}`);
  console.log('Notice: Configure RESEND_API_KEY or SMTP credentials in .env to deliver live emails.');
  console.log('====================================================');
  return { success: true, mode: 'mock_logged' };
};

/**
 * Template: Order Placed / Payment Submitted Confirmation
 */
export const sendOrderConfirmationEmail = async ({ order, customerEmail, customerName }) => {
  const isUPI = order.payment_method?.includes('UPI') || order.payment_method?.includes('QR');
  const subject = `Order Confirmed #${order.id.slice(0, 8).toUpperCase()} — MLA Sports`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #003da5; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">MLA SPORTS</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd;">Handcrafted Willow Bats — Mirgund, Kashmir</p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="font-size: 20px; color: #111827; margin-top: 0;">Thank you for your order, ${customerName || 'Valued Batsman'}!</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          Your order has been recorded in our workshop queue. Our master craftsmen will prepare, balance, and package your cricket equipment with extreme care.
        </p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #374151;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Order ID:</td>
              <td style="padding: 6px 0; font-weight: 700; text-align: right;">#${order.id.slice(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Payment Method:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right;">${order.payment_method}</td>
            </tr>
            ${order.payment_id ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">UPI Reference (UTR):</td>
              <td style="padding: 6px 0; font-weight: 700; color: #2563eb; text-align: right;">${order.payment_id}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Total Amount:</td>
              <td style="padding: 6px 0; font-size: 18px; font-weight: 800; color: #dc2626; text-align: right;">₹${Number(order.total_amount).toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        ${isUPI ? `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px; color: #1e40af;">
            <strong>💳 Payment Verification Notice:</strong> Your payment proof has been submitted. Our admin team will verify the transaction ID against our bank logs and send you an instant confirmation message upon verification.
          </div>
        ` : ''}

        <p style="color: #6b7280; font-size: 12px; margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          Need assistance or urgent dispatch? WhatsApp us directly at +91 99066 60000.<br/>
          MLA Sports, Mirgund, Budgam, Jammu &amp; Kashmir 193401
        </p>
      </div>
    </div>
  `;

  return dispatchEmail({ to: customerEmail, subject, html });
};

/**
 * Template: Admin Verified Payment Confirmation Email
 */
export const sendPaymentVerifiedEmail = async ({
  order,
  customerEmail,
  customerName,
  expected_delivery_date,
  tracking_number,
  courier_name,
}) => {
  const deliveryDate = expected_delivery_date || order.expected_delivery_date || 'Within 4-7 business days';
  const courier = courier_name || order.courier_name || 'All-India Express Courier';
  const tracking = tracking_number || order.tracking_number;
  const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
  const subject = `Payment Verified! Order Confirmed #${order.id.slice(0, 8).toUpperCase()} — Expected Delivery: ${deliveryDate} — MLA Sports`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669, #047857); padding: 26px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">PAYMENT VERIFIED &amp; CONFIRMED</h1>
        <p style="margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #a7f3d0;">MLA Sports — Kashmir Willow Master Craft</p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="font-size: 20px; color: #111827; margin-top: 0;">Payment Approved, ${customerName || 'Valued Batsman'}!</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          Great news! Our team has verified your UPI/QR payment for order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong>. Your order is officially <strong>Confirmed</strong> and moved into our workshop for final bat preparation.
        </p>

        <!-- Delivery & Order Highlights Box -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #166534; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-weight: 600;">📅 Expected Delivery Date:</td>
              <td style="padding: 6px 0; font-weight: 800; font-size: 15px; color: #047857; text-align: right;">${deliveryDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #15803d;">💰 Verified Amount:</td>
              <td style="padding: 6px 0; font-weight: 800; font-size: 16px; color: #15803d; text-align: right;">₹${Number(order.total_amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #15803d;">💳 Transaction ID (UTR):</td>
              <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #166534;">${order.payment_id || 'Bank Verified'}</td>
            </tr>
            ${tracking ? `
            <tr>
              <td style="padding: 6px 0; color: #15803d;">🚚 Courier Partner:</td>
              <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #166534;">${courier} (AWB: ${tracking})</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #15803d;">📦 Current Status:</td>
              <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #059669;">CONFIRMED &amp; IN PREPARATION</td>
            </tr>
          </table>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          Your bats are receiving final oiling, knocking, and safety packaging in our thermal bat sleeves. You can track your order live or download your official invoice using the buttons below.
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${appUrl}/track/${order.id}" style="display: inline-block; background: #003da5; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; padding: 12px 24px; border-radius: 8px; margin: 4px;">
            Track Order Live 📍
          </a>
          <a href="${appUrl}/orders/${order.id}?download=invoice" style="display: inline-block; background: #1f2937; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; padding: 12px 24px; border-radius: 8px; margin: 4px;">
            Download Official Bill / Invoice 📄
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          MLA Sports, Main Market, Mirgund, Budgam, Jammu &amp; Kashmir 193401<br/>
          Direct Inquiry: +91 9103696238 | Email: miraqib249@gmail.com
        </p>
      </div>
    </div>
  `;

  return dispatchEmail({ to: customerEmail, subject, html });
};

/**
 * Template: Payment Rejected / Re-upload Request Email
 */
export const sendPaymentRejectedEmail = async ({ order, customerEmail, customerName, reason }) => {
  const subject = `Action Required: Payment Verification for Order #${order.id.slice(0, 8).toUpperCase()} — MLA Sports`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #dc2626; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">PAYMENT VERIFICATION ISSUE</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #fecaca;">MLA Sports</p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="font-size: 18px; color: #111827; margin-top: 0;">Hello ${customerName || 'Customer'},</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          We could not verify your payment proof for order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong>.
        </p>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; color: #991b1b; font-size: 13px;">
          <strong>Reason provided by administrator:</strong><br/>
          ${reason || 'The transaction reference number (UTR) did not match our records or the screenshot was unreadable.'}
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          Please open your order details and re-upload a clear screenshot of your UPI debit receipt, or verify your 12-digit UTR number so we can confirm your order immediately.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/orders/${order.id}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; padding: 12px 28px; border-radius: 8px;">
            Re-Upload Payment Proof
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 28px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          If you have already paid, you can also share your receipt directly via WhatsApp at +91 99066 60000.<br/>
          MLA Sports, Mirgund, Budgam, J&amp;K
        </p>
      </div>
    </div>
  `;

  return dispatchEmail({ to: customerEmail, subject, html });
};
