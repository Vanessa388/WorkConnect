// server/utils/emailService.js - Email delivery for WorkConnect
// Uses SMTP when configured, so Gmail or another ordinary mail account can send without a verified domain.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM || process.env.SMTP_FROM || 'WorkConnect <onboarding@resend.dev>';

/**
 * Core Resend API caller — sends any email via Resend HTTP API.
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendEmail({ to, subject, html }) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_FROM_NAME || 'WorkConnect',
            email: process.env.BREVO_FROM,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(`[EmailService] ✕ Brevo error (${res.status}): ${data?.message || JSON.stringify(data)}`);
        return { success: false, error: data?.message || JSON.stringify(data) };
      }

      console.log(`[EmailService] ✓ Email sent to ${to} via Brevo (id: ${data.messageId})`);
      return { success: true, provider: 'brevo', id: data.messageId };
    } catch (err) {
      console.error('[EmailService] ✕ Network/fetch error calling Brevo API:', err.message);
      return { success: false, error: err.message };
    }
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;

  if (smtpUser && smtpPass && smtpHost) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `WorkConnect <${smtpUser}>`,
        to,
        subject,
        html,
      });

      console.log(`[EmailService] ✓ Email sent to ${to} via SMTP (id: ${info.messageId})`);
      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (err) {
      console.error('[EmailService] ✕ SMTP error:', err.message);
      return { success: false, error: err.message };
    }
  }

  if (!RESEND_API_KEY) {
    console.warn('[EmailService] No Brevo, SMTP, or Resend credentials configured — email skipped.');
    return { success: false, reason: 'No email provider configured in server/.env' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[EmailService] ✕ Resend error (${res.status}): ${data?.message || JSON.stringify(data)}`);
      return { success: false, error: data?.message || JSON.stringify(data) };
    }

    console.log(`[EmailService] ✓ Email sent to ${to} via Resend (id: ${data.id})`);
    return { success: true, provider: 'resend', id: data.id };
  } catch (err) {
    console.error('[EmailService] ✕ Network/fetch error calling Resend API:', err.message);
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// 1. Artisan Verification Email
//    Sent to an artisan when the admin approves their profile.
// ---------------------------------------------------------------------------

/**
 * @param {{ to: string, workerName: string, skill: string, location: string }} opts
 */
async function sendVerificationEmail({ to, workerName, skill, location }) {
  if (!to) {
    console.warn(`[EmailService] Skipped verification email: no recipient for artisan "${workerName}"`);
    return { success: false, reason: 'No recipient email provided' };
  }

  const subject = `🎉 Congratulations ${workerName}! Your WorkConnect Artisan Profile is Verified`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>WorkConnect Profile Verified</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .email-container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #ff6a00 0%, #ea580c 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .brand-name { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
        .message { font-size: 15px; line-height: 1.65; color: #475569; margin: 0 0 20px; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; }
        .card-row { margin-bottom: 8px; font-size: 14px; }
        .card-row:last-child { margin-bottom: 0; }
        .card-label { color: #64748b; font-weight: 600; display: inline-block; width: 160px; }
        .card-val { color: #0f172a; font-weight: 700; }
        .cta-container { text-align: center; margin: 28px 0; }
        .cta-btn { display: inline-block; background-color: #ff6a00; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 3px 10px rgba(255, 106, 0, 0.3); }
        .footer { background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="brand-name">WorkConnect</h1>
          <div class="badge">✓ Artisan Verified</div>
        </div>
        <div class="content">
          <h2 class="greeting">Congratulations, ${workerName}! 🎉</h2>
          <p class="message">
            Great news! Your artisan application has been reviewed and <strong>approved</strong> by the WorkConnect administration team. Your profile is now live and publicly visible!
          </p>

          <div class="card">
            <div style="font-size: 13px; font-weight: 700; color: #16a34a; margin-bottom: 12px;">
              ✓ Status: Active on WorkConnect Search &amp; AI Chatbot
            </div>
            <div class="card-row">
              <span class="card-label">Registered Trade:</span>
              <span class="card-val">${skill || 'Artisan Services'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Primary Service Area:</span>
              <span class="card-val">${location || 'Nigeria'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Verification Standing:</span>
              <span class="card-val" style="color: #16a34a;">Vetted &amp; Public</span>
            </div>
          </div>

          <p class="message">
            Customers in your area can now find you through our <strong>AI Chatbot</strong> and artisan directory, read your verified customer reviews, and call you directly for jobs.
          </p>

          <div class="cta-container">
            <a href="http://localhost:5173/profile" class="cta-btn" target="_blank">
              Open Your Artisan Dashboard →
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
            <strong>Pro Tip:</strong> Keep your contact phone active. Provide top-notch service and ask your happy customers to drop verified reviews on your WorkConnect profile to rank higher in chatbot recommendations.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} WorkConnect Nigeria &middot; Empowering local trusted artisans and customers.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// ---------------------------------------------------------------------------
// 2. New Worker Registration Alert — sent to ADMIN
//    Triggered whenever a new artisan/worker profile is created.
// ---------------------------------------------------------------------------

/**
 * @param {{ workerName: string, skill: string, location: string, phone?: string, email?: string }} opts
 */
async function sendNewWorkerAlertToAdmin({ workerName, skill, location, phone, email }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'vanessachimdimma@gmail.com';
  const subject = `🆕 New Artisan Registered — ${workerName} (${skill})`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Artisan Registration</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .email-container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .brand-name { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
        .message { font-size: 15px; line-height: 1.65; color: #475569; margin: 0 0 20px; }
        .card { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; }
        .card-row { margin-bottom: 10px; font-size: 14px; display: flex; align-items: flex-start; }
        .card-row:last-child { margin-bottom: 0; }
        .card-label { color: #0369a1; font-weight: 700; min-width: 120px; }
        .card-val { color: #0f172a; font-weight: 600; }
        .cta-container { text-align: center; margin: 28px 0; }
        .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 3px 10px rgba(37, 99, 235, 0.3); }
        .footer { background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .pending-badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #fcd34d; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="brand-name">WorkConnect Admin</h1>
          <div class="badge">🆕 New Artisan Registration</div>
        </div>
        <div class="content">
          <h2 class="greeting">A New Artisan Has Registered</h2>
          <p class="message">
            A new artisan just submitted their profile on WorkConnect and is <span class="pending-badge">⏳ Awaiting Approval</span>.
            Please log in to the admin portal to review and verify their details.
          </p>

          <div class="card">
            <div class="card-row">
              <span class="card-label">👤 Name:</span>
              <span class="card-val">${workerName || 'N/A'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">🔧 Trade / Skill:</span>
              <span class="card-val">${skill || 'N/A'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📍 Location:</span>
              <span class="card-val">${location || 'N/A'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">📞 Phone:</span>
              <span class="card-val">${phone || 'Not provided'}</span>
            </div>
            <div class="card-row">
              <span class="card-label">✉️ Email:</span>
              <span class="card-val">${email || 'Not provided'}</span>
            </div>
          </div>

          <div class="cta-container">
            <a href="http://localhost:5173/admin" class="cta-btn" target="_blank">
              Review in Admin Portal →
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            This is an automated notification from WorkConnect. The artisan's profile will remain <strong>hidden from customers</strong> until you approve it in the admin portal.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} WorkConnect Nigeria &middot; Admin Notification System
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

async function sendContactMessage({ name, email, phone, subject, message }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'vanessachimdimma@gmail.com';
  const subjectLine = `WorkConnect Contact — ${subject}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:24px auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
      <div style="background:#ff6a00;color:#fff;padding:24px"><h1 style="margin:0">New WorkConnect Contact Message</h1></div>
      <div style="padding:24px;color:#1e293b">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border:0;border-top:1px solid #e2e8f0;margin:20px 0">
        <p style="white-space:pre-wrap;line-height:1.6">${message}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject: subjectLine, html });
}

module.exports = {
  sendVerificationEmail,
  sendNewWorkerAlertToAdmin,
  sendContactMessage,
};
