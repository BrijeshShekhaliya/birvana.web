import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';

const GMAIL_USER = 'birvana.official.in@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

let cachedTransporter: any = null;

async function safeSendMail(opts: { to: string; subject: string; html: string }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn('[admin-send-custom-email] GMAIL_APP_PASSWORD not set — skipping email');
    return;
  }
  if (!cachedTransporter) {
    const nm = await import('nodemailer');
    cachedTransporter = nm.default.createTransport({
      pool: true,
      maxConnections: 3,
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  await cachedTransporter.sendMail({ from: `"Birvana Support" <${GMAIL_USER}>`, ...opts });
}

// ── Clean white Birvana email template with colored details ──────────────────
function buildEmail(opts: {
  subject: string;
  bodyHtml: string;
  themeColor: string; // e.g. #1DB954 for green, #3B82F6 for blue, #EF4444 for red
  preheader?: string;
  footerNote?: string;
}): string {
  const { subject, bodyHtml, themeColor, preheader = '', footerNote = '' } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;width:100%;margin:0 auto;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;text-align:left;">

          <!-- Logo with small colored accent dot -->
          <tr>
            <td style="padding-bottom:32px;">
              <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:2px;color:#171717;text-transform:uppercase;display:inline-block;">Birvana<span style="color:${themeColor};">.</span></h1>
            </td>
          </tr>

          <!-- Subject heading with theme color -->
          <tr>
            <td style="padding-bottom:24px;">
              <h2 style="margin:0;font-size:24px;font-weight:600;color:${themeColor};letter-spacing:-0.5px;">${subject}</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="font-size:16px;line-height:26px;color:#52525B;">
                ${bodyHtml}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #E4E4E7;">
              <p style="margin:0 0 8px 0;font-size:13px;line-height:18px;color:#71717A;">
                ${footerNote || 'You are receiving this email because you have an account with Birvana Music.'}
              </p>
              <p style="margin:0;font-size:13px;line-height:18px;color:#71717A;">
                Birvana Music &copy; 2026. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Template content ─────────────────────────────────────────────────────────
interface TemplateConfig {
  subject: string;
  html: string;
  themeColor: string;
  preheader?: string;
}

function getTemplateContent(type: string, customSubject: string, customMessage: string): TemplateConfig {
  switch (type) {
    case 'app_update':
      return {
        subject: "What's new in Birvana v1.1.4",
        themeColor: '#1DB954', // Birvana green
        preheader: "We just shipped a new update to Birvana.",
        html: `<p style="margin:0 0 20px;">We just shipped a new update to Birvana! Update your app from the Play Store to get the latest features and performance enhancements:</p>
<div style="background-color:#F4F4F5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
  <ul style="margin:0;padding-left:20px;color:#52525B;line-height:2.2;">
    <li><strong style="color:#171717;">⚡ Improved Search</strong> — Faster results with better relevance</li>
    <li><strong style="color:#171717;">🎵 New Playlist Editor</strong> — Reorder and rename tracks with ease</li>
    <li><strong style="color:#171717;">🎧 Audio Quality Settings</strong> — Choose your preferred stream quality</li>
    <li><strong style="color:#171717;">🐛 Performance Fixes</strong> — Smoother playback on all devices</li>
  </ul>
</div>
<div style="margin:28px 0;text-align:center;">
  <a href="https://play.google.com/store" style="background-color:#1DB954;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(29,185,84,0.25);">Update on Play Store</a>
  <a href="https://birvana.indevs.in" style="background-color:#ffffff;color:#171717;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;border:1px solid #E4E4E7;margin-left:12px;">Visit Website</a>
</div>
<p style="margin:0;">Enjoy the music!</p>`,
      };

    case 'forgot_password':
      return {
        subject: 'Reset your Birvana password',
        themeColor: '#3B82F6', // Trust blue
        preheader: 'Steps to regain access to your Birvana account.',
        html: `<p style="margin:0 0 20px;">We received a request to help you reset access to your Birvana account. Follow these steps to complete the reset:</p>
<div style="background-color:#F0F6FF;border-radius:8px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #3B82F6;">
  <p style="margin:0;color:#1E3A8A;font-weight:600;margin-bottom:12px;">How to reset your password:</p>
  <ol style="margin:0;padding-left:20px;color:#2563EB;line-height:2.2;">
    <li>Open the Birvana app</li>
    <li>Tap <strong style="color:#1E3A8A;">Login</strong> → <strong style="color:#1E3A8A;">Forgot Password</strong></li>
    <li>Enter your registered email address</li>
    <li>Check your inbox for the reset OTP code</li>
    <li>Enter the code and create a new password</li>
  </ol>
</div>
<div style="margin:28px 0;text-align:center;">
  <a href="https://birvana.indevs.in/login" style="background-color:#3B82F6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(59,130,246,0.25);">Go to Login</a>
</div>
<p style="margin:0;">If you do not receive a reset code, please reply to this email and our team will assist you.</p>`,
      };

    case 'scam_alert':
      return {
        subject: 'Security notice for your Birvana account',
        themeColor: '#EF4444', // Danger red
        preheader: 'Important: Unusual activity detected on your account.',
        html: `<p style="margin:0 0 20px;">We detected unusual activity that may indicate your account was targeted by a scam or phishing attempt. Please take action immediately to protect your profile.</p>
<div style="background-color:#FEF2F2;border-radius:8px;border-left:4px solid #EF4444;padding:20px 24px;margin-bottom:24px;">
  <p style="margin:0 0 12px;font-weight:600;color:#991B1B;">⚠️ What to do right now:</p>
  <ul style="margin:0;padding-left:20px;color:#B91C1C;line-height:2.2;">
    <li>Change your Birvana password immediately</li>
    <li>Do not share OTP codes with anyone</li>
    <li>Birvana will never ask for your password via email</li>
    <li>Contact us if you did not initiate any recent account changes</li>
  </ul>
</div>
<div style="margin:28px 0;text-align:center;">
  <a href="https://birvana.indevs.in/login" style="background-color:#EF4444;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(239,68,68,0.25);">Secure Account Now</a>
</div>
<p style="margin:0;">Your account security is our top priority. Reply to this email or contact our support team for immediate assistance.</p>`,
      };

    case 'custom':
    default:
      return {
        subject: customSubject || 'Message from Birvana Support',
        themeColor: '#171717', // Neutral black/charcoal
        html: `<p style="margin:0;">${(customMessage || '').replace(/\n/g, '<br/>')}</p>`,
      };
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await verifyUser(req);
    if (user.email?.toLowerCase() !== 'birvana.official.in@gmail.com') {
      return res.status(403).json({ error: 'Admin only' });
    }
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { targetUserId, templateType = 'app_update', customSubject = '', customMessage = '' } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Missing targetUserId' });

  const { data: profile } = await supabase.from('profiles').select('email, display_name').eq('id', targetUserId).single();
  if (!profile?.email) return res.status(404).json({ error: 'User not found or no email' });

  const { subject, html, themeColor, preheader } = getTemplateContent(templateType, customSubject, customMessage);

  try {
    await safeSendMail({
      to: profile.email,
      subject,
      html: buildEmail({ subject, bodyHtml: html, themeColor, preheader }),
    });

    // Log to email_logs if table exists
    try {
      await supabase.from('email_logs').insert({
        user_id: targetUserId,
        purpose: `automation_${templateType}`,
        recipient_email: profile.email,
        subject,
        status: 'sent',
      });
    } catch (_) { /* email_logs table may not exist yet */ }

    return res.status(200).json({ success: true, message: `Email dispatched to ${profile.email}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}
