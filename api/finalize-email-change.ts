import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';
import { sendMail } from './_mailer.js';
import { logEmail } from './_logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate user session
    const user = await verifyUser(req);
    const oldEmail = user.email;
    const { newEmail, token } = req.body;

    if (!oldEmail || !newEmail || !token) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 2. Validate OTP code in db
    const { data: records, error: dbError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', newEmail.toLowerCase().trim())
      .eq('otp_code', String(token).trim())
      .eq('purpose', 'verify_new_email')
      .limit(1);

    if (dbError) throw dbError;

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const record = records[0];
    const expiresAt = new Date(record.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // 3. Update the email in Supabase Auth via Admin Client API
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email: newEmail.toLowerCase().trim() }
    );

    if (updateAuthError) {
      console.error('Supabase Admin API email update error:', updateAuthError);
      throw new Error('Failed to update email in authentication service');
    }

    // 4. Update the email column in the public profiles table
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ email: newEmail.toLowerCase().trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Supabase Profiles profile update error:', updateProfileError);
      throw new Error('Failed to update email in user profile');
    }

    // 5. Delete used OTP code
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', record.id);

    // 6. Get user display name to customize the message
    let displayName = 'Birvana User';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', user.id)
        .single();
      if (profile) {
        displayName = profile.display_name?.trim() || profile.username?.trim() || displayName;
      }
    } catch (err) {
      // Fallback
    }

    // 7. Send Security Alert to OLD EMAIL using Google SMTP
    const oldEmailSubject = `Your Birvana account email has been updated`;
    const oldEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert: Email Removed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; -webkit-font-smoothing: antialiased;">
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
              <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #EF4444; letter-spacing: -0.5px;">Security Alert: Email Removed</h2>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #52525B;">
                Hello ${displayName},<br/><br/>
                This email address is no longer registered with your Birvana account. You can no longer access the account or stream using this address.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 24px; color: #52525B;">
                If you did not authorize this action, please contact support at <a href="mailto:birvana.official.in@gmail.com" style="color: #4A90E2; text-decoration: none; font-weight: 600;">birvana.official.in@gmail.com</a> within 7 days.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 15px; line-height: 22px; color: #71717A; background-color: #FEF2F2; border: 1px solid #FEE2E2; padding: 16px; border-radius: 8px;">
                <strong>Important:</strong> Keep a screenshot of the verification OTP code you received regarding this change. Attach it to your support inquiry. Our help team will review and reach out to you within 48 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #E4E4E7;">
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

    // 8. Send Congratulations to NEW EMAIL using Google SMTP
    const newEmailSubject = `Welcome to your new Birvana account email!`;
    const newEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Birvana Email Changed Successfully</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; -webkit-font-smoothing: antialiased;">
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
              <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #1DB954; letter-spacing: -0.5px;">Congratulations!</h2>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #52525B;">
                Hello ${displayName},<br/><br/>
                Your Birvana account email address has been successfully updated from <strong style="color: #171717;">${oldEmail}</strong> to <strong style="color: #171717;">${newEmail}</strong>.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 24px; color: #52525B;">
                We are happy to have you back! You can now log in and access your library, playlists, and settings using this email address. Enjoy streaming your music!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #E4E4E7;">
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 18px; color: #71717A;">
                If you face any issues or have questions, please contact our support team.
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

    // Send both emails in parallel via Google SMTP
    await Promise.all([
      sendMail(oldEmail, oldEmailSubject, oldEmailHtml),
      sendMail(newEmail, newEmailSubject, newEmailHtml),
    ]);
    await Promise.all([
      logEmail(oldEmail, 'security_alert_email_change', oldEmailSubject),
      logEmail(newEmail, 'congratulations_email_change', newEmailSubject)
    ]);

    return res.status(200).json({ success: true, message: 'Email updated successfully and notifications sent' });
  } catch (error: any) {
    console.error('API Error in finalize-email-change:', error);
    return res.status(error.message.startsWith('Unauthorized') ? 401 : 500).json({ error: error.message });
  }
}
