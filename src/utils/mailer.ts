import nodemailer from 'nodemailer';
import {MAIL_USER, MAIL_PASS,MAIL_HOST,MAIL_PORT} from '../config/dotenv.config';

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export const sendWaitlistEmail = async (to: string) => {
  await transporter.sendMail({
    from: MAIL_USER,
    to,
    subject: '🎉 You’ve joined the waitlist!',
    html: `<p>Thanks for joining! We'll keep you posted about updates.</p>`,
  });
};
