import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_db.js';
import nodemailer from 'nodemailer';

const GMAIL_USER = 'birvana.official.in@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

let cachedTransporter: any = null;

// Only send email if GMAIL_APP_PASSWORD is configured
async function safeSendMail(opts: { to: string; subject: string; html: string }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn('[submit-ticket] GMAIL_APP_PASSWORD not set — skipping confirmation email');
    return;
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 3,
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  await cachedTransporter.sendMail({ from: `"Birvana Support" <${GMAIL_USER}>`, ...opts });
}

// Auto-detect category
function detectCategory(subject: string, body: string): string {
  const text = `${subject} ${body}`.toLowerCase();
  if (/forgot|reset|password/.test(text)) return 'Password Reset';
  if (/lost.*account|recover.*account|account.*recovery|can.?t.*login|locked/.test(text)) return 'Account Recovery';
  if (/login|sign.?in|access/.test(text)) return 'Login Issue';
  if (/scam|hack|fraud|stolen/.test(text)) return 'Scam Recovery';
  if (/payment|billing|refund/.test(text)) return 'Payment';
  if (/premium|subscription|upgrade/.test(text)) return 'Subscription';
  if (/bug|crash|error|broken|not working/.test(text)) return 'Bug Report';
  if (/feature|suggest|improve/.test(text)) return 'Feature Request';
  return 'General Inquiry';
}

function detectPriority(subject: string, body: string): string {
  const text = `${subject} ${body}`.toLowerCase();
  if (/urgent|emergency|scam|hack|fraud|asap/.test(text)) return 'Critical';
  if (/account.*recovery|lost.*account|suspended/.test(text)) return 'High';
  if (/bug|broken|payment/.test(text)) return 'Medium';
  return 'Low';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, subject, message, userId } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Missing email, subject, or message' });
  }

  try {
    const category = detectCategory(subject, message);
    const priority  = detectPriority(subject, message);

    // Check if registered user
    const { data: profile } = await supabase
      .from('profiles').select('id, email').eq('email', email.toLowerCase()).maybeSingle();

    // Check if there is an existing active case (not resolved/archived) for this email
    const { data: activeCase } = await supabase
      .from('support_cases')
      .select('id, subject, category')
      .eq('sender_email', email.toLowerCase().trim())
      .not('status', 'in', '("resolved","archived")')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let targetCaseId = '';
    let isNewCase = false;

    if (activeCase) {
      targetCaseId = activeCase.id;
      // Update existing case status to new/waiting_admin and touch updated_at
      await supabase
        .from('support_cases')
        .update({
          status: 'new',
          unread: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetCaseId);

      // Log activity
      await supabase.from('support_activity').insert({
        case_id: targetCaseId,
        action: 'message_received',
        new_value: `Added message to existing Case: ${subject}`,
        actor: 'User'
      });
    } else {
      isNewCase = true;
      // Create support case
      const { data: newCase, error: caseErr } = await supabase.from('support_cases').insert({
        source: 'form',
        user_type: profile ? 'registered' : 'external',
        user_id: profile?.id || null, // Always resolve dynamically to profile matching the email
        sender_email: email.toLowerCase().trim(),
        sender_name: email.split('@')[0],
        subject: subject.trim(),
        category,
        priority,
        status: 'new',
        unread: true,
      }).select('id').single();

      if (caseErr || !newCase) throw caseErr || new Error('Failed to create case');
      targetCaseId = newCase.id;

      // Log activity
      await supabase.from('support_activity').insert({
        case_id: targetCaseId,
        action: 'case_created',
        new_value: `Form submission from ${email}`,
        actor: 'System',
      });
    }

    // Create message under the case
    await supabase.from('support_messages').insert({
      case_id: targetCaseId,
      sender: 'user',
      sender_name: email.split('@')[0],
      body: message.trim(),
    });

    // Send confirmation email to user (only for new cases; skipped silently if GMAIL_APP_PASSWORD not set)
    if (isNewCase) {
      try {
        await safeSendMail({
          to: email,
          subject: `We received your message`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your message — Birvana</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your support case has been created. We'll be in touch within 24 hours.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;width:100%;margin:0 auto;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;margin:0 auto;text-align:left;">
          <tr>
            <td style="padding-bottom:32px;">
              <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:2px;color:#171717;text-transform:uppercase;">Birvana</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <h2 style="margin:0;font-size:24px;font-weight:600;color:#171717;letter-spacing:-0.5px;">We got your message</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:16px;line-height:26px;color:#52525B;">
                Thank you for reaching out. A support case has been created and our team will get back to you within 24 hours.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="background-color:#F4F4F5;border-radius:8px;padding:20px 24px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1.5px;color:#71717A;text-transform:uppercase;">Your inquiry</p>
                <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#171717;">${subject}</p>
                <p style="margin:0;font-size:13px;color:#71717A;">Category: ${category}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;border-top:1px solid #E4E4E7;">
              <p style="margin:0 0 8px;font-size:13px;line-height:18px;color:#71717A;">
                If you did not submit this request, you can safely ignore this email.
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
</html>`,
        });
      } catch (emailErr) {
        console.warn('[submit-ticket] Email send failed (non-fatal):', emailErr);
      }
    }

    return res.status(200).json({ success: true, message: 'Support case submitted successfully' });
  } catch (err: any) {
    console.error('submit-ticket error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
