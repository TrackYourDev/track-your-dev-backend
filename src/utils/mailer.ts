import nodemailer from "nodemailer";
import {
  MAIL_USER,
  MAIL_PASS,
  MAIL_HOST,
  MAIL_PORT,
} from "../config/dotenv.config";

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
    subject: "🎉 You’ve joined the waitlist!",
    html: `<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0; background: #0D0D0D; color: #FFFFFF; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

<head>
  <meta charset="UTF-8">
  <title>TrackYourDev Waitlist Confirmation</title>
</head>

<body style="margin: 0; padding: 0; background-color: #0D0D0D; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #0D0D0D; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #1A1A1A; border-radius: 10px; box-shadow: 0 0 20px rgba(0,255,255,0.1); overflow: hidden;">
          <tr>
            <td style="padding: 30px; text-align: center;">
              <h1 style="color: #00FFF7; font-size: 32px; margin-bottom: 10px;">✅ You're on the Waitlist</h1>
              <h2 style="color: #FFFFFF; font-size: 24px; font-weight: 400;">Welcome to</h2>
              <h1 style="color: #00FFF7; font-size: 36px; margin: 10px 0;">TrackYourDev</h1>
              <p style="color: #CCCCCC; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                <em>Track your dev team with ZERO friction</em>
              </p>

              <p style="color: #CCCCCC; font-size: 16px; line-height: 1.8; margin-top: 30px;">
                TrackYourDev is redefining productivity tracking for engineering teams. Say goodbye to ToDo lists, Jira sprints, and daily standups. With seamless integration into your GitHub repositories, our platform captures developer activity in real-time—no manual input required.
              </p>

              <p style="color: #CCCCCC; font-size: 16px; line-height: 1.8;">
                Every commit, push, and pull request is automatically analyzed to deliver clear, insightful dashboards for managers, team leads, and developers alike. No friction. Just flow.
              </p>

              <hr style="border: none; border-top: 1px solid #333; margin: 40px 0;">

              <p style="font-size: 14px; color: #777777;">
                You'll be the first to know when we launch.<br>
                In the meantime, follow our journey:
              </p>

              <div style="margin-top: 20px;">
                <a href="https://x.com/TrackYourDev" style="color: #00FFF7; text-decoration: none; margin: 0 10px;">X</a> |
                <a href="https://discord.gg/rtGrJ2n2Gz" style="color: #00FFF7; text-decoration: none; margin: 0 10px;">Discord</a> |
                <a href="https://trackyour.dev" style="color: #00FFF7; text-decoration: none; margin: 0 10px;">Website</a>
              </div>

              <p style="font-size: 12px; color: #555; margin-top: 40px;">© 2025 TrackYourDev. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

</html>`,
  });
};
