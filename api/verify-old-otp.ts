import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, verifyUser } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyUser(req);
    const email = user.email;
    const { token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Query OTP code from db
    const { data: records, error: dbError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp_code', String(token).trim())
      .eq('purpose', 'verify_old_email')
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (dbError) {
      console.error('Database query error checking OTP:', dbError);
      return res.status(500).json({ error: 'Failed to verify verification code' });
    }

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // OTP is valid! Delete it immediately so it cannot be used again (single-use token)
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('purpose', 'verify_old_email');

    return res.status(200).json({ success: true, message: 'Current email verification successful' });
  } catch (error: any) {
    console.error('API Error in verify-old-otp:', error);
    return res.status(error.message.startsWith('Unauthorized') ? 401 : 500).json({ error: error.message });
  }
}
