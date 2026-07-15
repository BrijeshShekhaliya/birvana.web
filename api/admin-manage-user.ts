import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';
import { sendMail } from './_mailer.js';
import { logEmail } from './_logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate user
    const admin = await verifyUser(req);
    const adminEmail = admin.email || '';

    // 2. Authorize admin
    if (adminEmail.toLowerCase() !== 'birvana.official.in@gmail.com') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const { action, targetUserId } = req.body;

    if (!action || !targetUserId) {
      return res.status(400).json({ error: 'Missing action or targetUserId' });
    }

    // ACTION: Get Liked Songs, Playlists, OTPs, and Email logs
    if (action === 'get_liked_songs') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', targetUserId)
        .single();

      const userEmail = profile?.email || '';

      const [songsRes, playlistsRes, otpsRes, logsRes] = await Promise.all([
        supabase.from('user_liked_songs').select('metadata').eq('user_id', targetUserId),
        supabase.from('user_saved_playlists').select('metadata').eq('user_id', targetUserId),
        userEmail ? supabase.from('otp_codes').select('*').eq('email', userEmail.toLowerCase().trim()) : Promise.resolve({ data: [] }),
        userEmail ? supabase.from('email_logs').select('*').eq('recipient_email', userEmail.toLowerCase().trim()).order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
      ]);

      if (songsRes.error) throw songsRes.error;
      if (playlistsRes.error) throw playlistsRes.error;

      const songs = (songsRes.data || []).map((row: any) => row.metadata);
      const playlists = (playlistsRes.data || []).map((row: any) => row.metadata);
      const otpCodes = otpsRes.data || [];
      const emailLogs = logsRes.data || [];

      return res.status(200).json({ 
        success: true, 
        songs, 
        playlists,
        otpCodes, 
        emailLogs 
      });
    }

    // ACTION: Administrative Email Recovery Update/Revert (Scam Helper)
    if (action === 'update_email') {
      const { newEmail } = req.body;
      if (!newEmail || !newEmail.includes('@')) {
        return res.status(400).json({ error: 'A valid email is required' });
      }

      // Fetch current user details
      const { data: profile, error: getProfileError } = await supabase
        .from('profiles')
        .select('email, display_name, username')
        .eq('id', targetUserId)
        .single();
      
      if (getProfileError || !profile) throw new Error('User profile not found');
      const oldEmail = profile.email;
      const displayName = profile.display_name?.trim() || profile.username?.trim() || 'Birvana User';

      // 1. Update Auth.users
      const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, {
        email: newEmail.toLowerCase().trim(),
        email_confirm: true // Mark as confirmed instantly
      });
      if (authError) throw authError;

      // 2. Update public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: newEmail.toLowerCase().trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);
      
      if (profileError) throw profileError;

      // 3. Send Professional Administrative Account Reversion Emails
      const restoredSubject = '🚨 Security: Your Birvana account has been successfully recovered';
      const removedSubject = '⚠️ Security Alert: Birvana account email reverted';

      const restoredHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Account Restored</title>
</head>
<body style="background-color: #ffffff; font-family: -apple-system, sans-serif; color: #171717; margin: 0; padding: 40px 20px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; margin: 0 auto;">
    <tr>
      <td style="padding-bottom: 24px; border-bottom: 1px solid #F4F4F5;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #171717; text-transform: uppercase;">Birvana</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #E11D48; text-transform: uppercase; font-weight: bold;">Security Account Restoration</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 0;">
        <p style="font-size: 16px; line-height: 24px; margin: 0 0 16px 0; color: #18181B;">
          Hello ${displayName},
        </p>
        <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px 0; color: #52525B;">
          This email is to confirm that an administrator has successfully processed your account help request and reverted your Birvana account's primary email address to this address: <strong>${newEmail}</strong>.
        </p>
        <div style="background-color: #F8FAFC; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1E3A8A; text-transform: uppercase;">What to do now:</p>
          <ol style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #1E40AF; line-height: 20px;">
            <li>Log back in using this email address: <strong>${newEmail}</strong>.</li>
            <li>Go to settings and change your password immediately to secure your credentials.</li>
            <li>Enable device lock verification if applicable.</li>
          </ol>
        </div>
        <p style="font-size: 14px; line-height: 22px; color: #71717A;">
          If you have any questions or require further security checks, reply to this ticket or contact us at birvana.official.in@gmail.com.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 24px; border-top: 1px solid #E4E4E7; font-size: 12px; color: #A1A1AA;">
        Birvana Music Security &copy; 2026. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`;

      const removedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Security Update</title>
</head>
<body style="background-color: #ffffff; font-family: -apple-system, sans-serif; color: #171717; margin: 0; padding: 40px 20px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; margin: 0 auto;">
    <tr>
      <td style="padding-bottom: 24px; border-bottom: 1px solid #F4F4F5;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #171717; text-transform: uppercase;">Birvana</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #71717A; text-transform: uppercase; font-weight: bold;">Security Notification</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 0;">
        <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px 0; color: #52525B;">
          This is an automated security notice. The Birvana account associated with this address has been reverted to its original contact email (<strong>${newEmail}</strong>) by a system administrator following a security review.
        </p>
        <p style="font-size: 14px; line-height: 22px; color: #71717A; margin: 0;">
          No further actions are required from this address. If you believe this action was taken in error, contact support at birvana.official.in@gmail.com.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding-top: 24px; border-top: 1px solid #E4E4E7; font-size: 12px; color: #A1A1AA;">
        Birvana Music Security &copy; 2026. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        if (oldEmail && oldEmail.toLowerCase() !== newEmail.toLowerCase()) {
          await sendMail(oldEmail, removedSubject, removedHtml);
          await logEmail(oldEmail, 'security_alert_email_change', removedSubject);
        }
        await sendMail(newEmail, restoredSubject, restoredHtml);
        await logEmail(newEmail, 'congratulations_email_change', restoredSubject);
      } catch (err) {
        console.error('[Admin Recovery] Failed to send email alerts:', err);
      }

      return res.status(200).json({ success: true, message: 'User email reverted successfully. Restoration emails dispatched.' });
    }

    // ACTION: Purge Account
    if (action === 'delete') {
      const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId);
      if (authError) {
        console.warn('Supabase Auth User delete warning:', authError.message);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (profileError) throw profileError;

      await Promise.all([
        supabase.from('user_liked_songs').delete().eq('user_id', targetUserId),
        supabase.from('user_recent_plays').delete().eq('user_id', targetUserId),
        supabase.from('user_saved_playlists').delete().eq('user_id', targetUserId),
        supabase.from('user_followed_artists').delete().eq('user_id', targetUserId)
      ]);

      return res.status(200).json({ success: true, message: 'User account and profile data fully purged.' });
    }

    return res.status(400).json({ error: 'Invalid action specified' });
  } catch (error: any) {
    console.error('Error in admin-manage-user:', error);
    return res.status(error.message?.startsWith('Unauthorized') ? 401 : 500).json({ error: error.message || 'Internal server error' });
  }
}
