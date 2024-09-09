import type { AppContext } from "@/context";
import type { Transporter } from "nodemailer";

import { createTransport } from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export class Mailer {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(opts: { env: AppContext["environment"] }) {
    this.from = opts.env.SMTP_FROM;
    this.transporter = createTransport({
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
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text
    });
  }
}
