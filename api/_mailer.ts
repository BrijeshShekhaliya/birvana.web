import nodemailer from 'nodemailer';

const user = process.env.GMAIL_USER || 'birvana.official.in@gmail.com';
const pass = process.env.GMAIL_APP_PASSWORD || 'hrlrlrjoqkaftlmw';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: `"Birvana Music" <${user}>`,
    to,
    subject,
    html,
  });
}
