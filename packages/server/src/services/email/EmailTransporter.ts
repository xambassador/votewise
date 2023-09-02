import dotenv from "dotenv";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import { logger } from "@votewise/lib/logger";

dotenv.config();

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const username = process.env.SMTP_USERNAME;
const password = process.env.SMTP_PASSWORD;
const from = process.env.SMTP_FROM;
const fromMail = process.env.SMTP_FROM_EMAIL || "help.votewise@gmail.com";

if (!host || !port || !username || !password || !from) {
  throw new Error("Missing SMTP configuration");
}

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export class EmailTransporter {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;

  private mailOptions: EmailOptions;

  private init() {
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  constructor(mailOptions: EmailOptions) {
    if (from) {
      this.mailOptions = { ...mailOptions, from: `${from} - ${fromMail}` };
    } else {
      this.mailOptions = mailOptions;
    }
    this.init();
  }

  public async send() {
    if (!this.transporter) {
      throw new Error("Transporter is not initialized");
    }
    try {
      await this.transporter.sendMail(this.mailOptions);
    } catch (err) {
      logger(`Failed to send email: ${err}`, "error");
      throw new Error("Failed to send email");
    }
  }
}
