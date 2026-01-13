// src/lib/mail.ts
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const transporter: Transporter =
  process.env.GMAIL_USER && process.env.GMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
        debug: true,
        logger: true,
      })
    : ({
        async sendMail() {
          return {
            accepted: [],
            rejected: [],
            envelopeTime: 0,
            messageTime: 0,
            messageSize: 0,
            response: "Mailing disabled in preview mode",
            envelope: { from: "", to: [] },
            messageId: "preview-mail",
          };
        },
      } as unknown as Transporter);

interface SendPasswordResetEmailOptions {
  email: string;
  token: string;
}

export async function sendPasswordResetEmail({ email, token }: SendPasswordResetEmailOptions) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  const result = await transporter.sendMail({
    from: {
      name: "YourAppName",
      address: process.env.GMAIL_USER!,
    },
    replyTo: "noreply@yourappname.com",
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0f766e;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">Thanks,<br />The YourAppName Team</p>
      </div>
    `,
  });

  return result;
}
