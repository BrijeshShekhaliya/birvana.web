import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';
import { sendMail } from './_mailer.js';
import { logEmail } from './_logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate the user session
    const user = await verifyUser(req);
    const email = user.email;

    if (!email) {
      return res.status(400).json({ error: 'User does not have an active email address' });
    }

    // 2. Generate a 6-digit OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // 3. Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_codes')
      .upsert({
        email: email.toLowerCase(),
        otp_code: otp,
        purpose: 'verify_old_email',
        expires_at: expiresAt,
      }, {
        onConflict: 'email,purpose'
      });

    if (dbError) {
      console.error('Database error storing OTP:', dbError);
      return res.status(500).json({ error: 'Failed to generate verification code' });
    }

    // 4. Send branded identity verification email using Google SMTP
    const subject = `${otp} is your Birvana verification code`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Identity</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; -webkit-font-smoothing: antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your Birvana verification code is ${otp}</div>
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; width: 100%; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; margin: 0 auto; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #171717; text-transform: uppercase;">Birvana</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #171717; letter-spacing: -0.5px;">Confirm your identity</h2>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #52525B;">
                Use the verification code below to authorize security changes to your Birvana account (such as changing your email address). For your security, <strong>do not share this code with anyone</strong>. If you did not request this, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding-bottom: 40px;">
              <div style="background-color: #F4F4F5; border-radius: 8px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; color: #71717A; text-transform: uppercase;">Verification Code</p>
                <p style="margin: 0; font-size: 44px; font-weight: 700; letter-spacing: 8px; color: #171717; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding-left: 8px;">${otp}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #E4E4E7;">
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 18px; color: #71717A;">
                If you did not request this verification, please secure your account credentials.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 18px; color: #71717A;">
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

    await sendMail(email, subject, html);
    await logEmail(email, 'identity_verification_otp', subject);

    return res.status(200).json({ success: true, message: 'OTP sent successfully to current email' });
  } catch (error: any) {
    console.error('API Error in send-old-otp:', error);
    return res.status(error.message.startsWith('Unauthorized') ? 401 : 500).json({ error: error.message });
  }
}
