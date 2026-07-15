import { supabase } from './_db.js';

export async function logEmail(recipient: string, purpose: string, subject: string, status: 'sent' | 'failed' = 'sent') {
  try {
    const { error } = await supabase.from('email_logs').insert({
      recipient_email: recipient.toLowerCase(),
      purpose,
      subject,
      status
    });
    if (error) throw error;
  } catch (err) {
    console.error('[Logger] Failed to write record to email_logs:', err);
  }
}
