import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';
import { google } from 'googleapis';

const ADMIN_EMAIL = 'birvana.official.in@gmail.com';
const GMAIL_APP_PASSWORD  = process.env.GMAIL_APP_PASSWORD || '';
const GMAIL_CLIENT_ID     = process.env.GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';

let cachedTransporter: any = null;

async function safeSendMail(opts: { to: string; subject: string; html: string }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn('[admin-support-actions] GMAIL_APP_PASSWORD not set — skipping outbound email');
    return;
  }
  if (!cachedTransporter) {
    const nm = await import('nodemailer');
    cachedTransporter = nm.default.createTransport({
      pool: true,
      maxConnections: 3,
      service: 'gmail',
      auth: { user: ADMIN_EMAIL, pass: GMAIL_APP_PASSWORD },
    });
  }
  await cachedTransporter.sendMail({ from: `"Birvana Support" <${ADMIN_EMAIL}>`, ...opts });
}

async function assertAdmin(req: VercelRequest) {
  const user = await verifyUser(req);
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error('Admin only');
}

// ─── REPLY OR ADD NOTE ───────────────────────────────────────────────────────
function buildReplyEmail(subject: string, bodyHtml: string, caseNumber: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Birvana Support has replied to your case #${caseNumber}.</div>
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
              <h2 style="margin:0;font-size:24px;font-weight:600;color:#171717;letter-spacing:-0.5px;">${subject}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="font-size:16px;line-height:26px;color:#52525B;">${bodyHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="background-color:#F4F4F5;border-radius:8px;padding:16px 20px;">
                <p style="margin:0;font-size:13px;color:#71717A;">Case #${caseNumber} — Reply to this email to continue the conversation with our support team.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;border-top:1px solid #E4E4E7;">
              <p style="margin:0 0 8px;font-size:13px;line-height:18px;color:#71717A;">
                This email was sent from Birvana Support in response to your inquiry.
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


async function handleReply(req: VercelRequest, res: VercelResponse) {
  const { caseId, body, addNote } = req.body;
  if (!caseId) return res.status(400).json({ error: 'Missing caseId' });
  if (!body?.trim()) return res.status(400).json({ error: 'Body required' });

  if (addNote) {
    const { data, error } = await supabase.from('support_notes').insert({
      case_id: caseId, admin_name: 'Admin', note: body.trim(),
    }).select().single();
    if (error) throw error;
    await supabase.from('support_activity').insert({
      case_id: caseId, action: 'note_added', new_value: body.trim().slice(0, 80), actor: 'Admin',
    });
    return res.status(200).json({ success: true, note: data });
  }

  const { data: caseData, error: caseErr } = await supabase
    .from('support_cases').select('*').eq('id', caseId).single();
  if (caseErr || !caseData) return res.status(404).json({ error: 'Case not found' });

  const { data: msg, error: msgErr } = await supabase.from('support_messages').insert({
    case_id: caseId, sender: 'admin', sender_name: 'Birvana Support', body: body.trim(),
  }).select().single();
  if (msgErr) throw msgErr;

  await supabase.from('support_cases').update({ status: 'waiting_user', unread: false }).eq('id', caseId);
  await supabase.from('support_activity').insert({
    case_id: caseId, action: 'reply_sent', new_value: `Reply to ${caseData.sender_email}`, actor: 'Admin',
  });

  try {
    await safeSendMail({
      to: caseData.sender_email,
      subject: `Re: ${caseData.subject}`,
      html: buildReplyEmail(`Re: ${caseData.subject}`, body.trim().replace(/\n/g, '<br/>'), caseData.case_number),
    });
  } catch (e) { console.error('[admin-support-actions] Email send error:', e); }

  return res.status(200).json({ success: true, message: msg });
}

// ─── GMAIL SYNC ──────────────────────────────────────────────────────────────
function detectCategory(subject: string, body: string): string {
  const t = `${subject} ${body}`.toLowerCase();
  if (/forgot|reset|password/.test(t)) return 'Password Reset';
  if (/lost.*account|recover.*account|can.?t.*login|locked/.test(t)) return 'Account Recovery';
  if (/login|sign.?in|access/.test(t)) return 'Login Issue';
  if (/scam|hack|fraud|stolen/.test(t)) return 'Scam Recovery';
  if (/payment|billing|refund/.test(t)) return 'Payment';
  if (/premium|subscription|upgrade/.test(t)) return 'Subscription';
  if (/bug|crash|error|broken|not working/.test(t)) return 'Bug Report';
  if (/feature|suggest|improve/.test(t)) return 'Feature Request';
  return 'General Inquiry';
}

function detectPriority(subject: string, body: string): string {
  const t = `${subject} ${body}`.toLowerCase();
  if (/urgent|emergency|scam|hack|fraud|asap/.test(t)) return 'Critical';
  if (/account.*recovery|lost.*account|suspended/.test(t)) return 'High';
  if (/bug|broken|payment/.test(t)) return 'Medium';
  return 'Low';
}

function decodeBase64(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    for (const p of payload.parts) {
      if (p.mimeType === 'text/plain' && p.body?.data) return decodeBase64(p.body.data);
    }
    for (const p of payload.parts) {
      if (p.mimeType === 'text/html' && p.body?.data) {
        return decodeBase64(p.body.data).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }
  return '';
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

async function handleGmailSync(req: VercelRequest, res: VercelResponse) {
  if (!GMAIL_CLIENT_ID || !GMAIL_REFRESH_TOKEN) {
    return res.status(400).json({ error: 'Gmail OAuth2 not configured. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN to Vercel env vars.' });
  }

  const oAuth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const listRes = await gmail.users.messages.list({
    userId: 'me', maxResults: 50, q: `in:inbox -from:${ADMIN_EMAIL}`,
  });

  const messages = listRes.data.messages || [];
  let imported = 0, skipped = 0;

  for (const msg of messages) {
    if (!msg.id) continue;

    const { count } = await supabase.from('support_messages')
      .select('*', { count: 'exact', head: true }).eq('gmail_msg_id', msg.id);
    if ((count ?? 0) > 0) { skipped++; continue; }

    const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
    const headers = fullMsg.data.payload?.headers || [];
    const fromHeader = getHeader(headers, 'from');
    const subject    = getHeader(headers, 'subject') || '(No Subject)';
    const threadId   = fullMsg.data.threadId || msg.id;

    const fromMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>$/) || ['', '', fromHeader];
    const senderName  = fromMatch[1]?.trim().replace(/^"|"$/g, '') || '';
    const senderEmail = (fromMatch[2] || fromHeader).trim().toLowerCase();

    if (senderEmail === ADMIN_EMAIL.toLowerCase()) { skipped++; continue; }

    const bodyText  = extractBody(fullMsg.data.payload);
    const category  = detectCategory(subject, bodyText);
    const priority  = detectPriority(subject, bodyText);

    const { data: profile } = await supabase.from('profiles').select('id')
      .eq('email', senderEmail).maybeSingle();

    const { data: existingCase } = await supabase.from('support_cases').select('id')
      .eq('gmail_thread_id', threadId).maybeSingle();

    let caseId: string;
    if (existingCase) {
      caseId = existingCase.id;
      await supabase.from('support_cases').update({
        status: 'waiting_admin', unread: true, updated_at: new Date().toISOString()
      }).eq('id', caseId);
    } else {
      const { data: newCase, error: caseErr } = await supabase.from('support_cases').insert({
        source: 'gmail', user_type: profile ? 'registered' : 'external',
        user_id: profile?.id || null, sender_email: senderEmail,
        sender_name: senderName || senderEmail, subject, category, priority,
        status: 'new', gmail_thread_id: threadId, unread: true,
      }).select('id').single();
      if (caseErr || !newCase) { console.error('Case insert error:', caseErr); continue; }
      caseId = newCase.id;
      await supabase.from('support_activity').insert({
        case_id: caseId, action: 'case_created', new_value: `Gmail: ${senderEmail}`, actor: 'System',
      });
    }

    await supabase.from('support_messages').insert({
      case_id: caseId, sender: 'user', sender_name: senderName || senderEmail,
      body: bodyText.trim() || '(No body)', gmail_msg_id: msg.id,
    });
    imported++;
  }

  return res.status(200).json({ success: true, imported, skipped });
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try { await assertAdmin(req); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }

  const { action } = req.body;

  try {
    if (action === 'gmail_sync') return handleGmailSync(req, res);
    return handleReply(req, res); // default: reply/note
  } catch (err: any) {
    console.error('admin-support-actions error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
