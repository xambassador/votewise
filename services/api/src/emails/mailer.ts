import type { AppContext } from "@/context";

import nodemailer from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export class Mailer {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(opts: { env: AppContext["environment"] }) {
    this.from = opts.env.SMTP_FROM;
    this.transporter = nodemailer.createTransport({
      host: opts.env.SMTP_HOST,
      port: opts.env.SMTP_PORT,
      auth: {
        user: opts.env.SMTP_USERNAME,
        pass: opts.env.SMTP_PASSWORD
      },
      secure: opts.env.SMTP_SECURE_ENABLED
    });
  }

  async send(options: EmailOptions) {
    const { to, subject, html, text } = options;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text
      });
    } catch (err) {
      // Throw an error so the queue can retry
      if (err instanceof Error) {
        throw new Error(`Failed to send email: ${err.message}`);
      }
      throw new Error(`Failed to send email: Unknown error`);
    }
  }
}
