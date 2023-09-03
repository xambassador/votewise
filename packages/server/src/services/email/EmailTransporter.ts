import type SMTPTransport from "nodemailer/lib/smtp-transport";

import nodemailer from "nodemailer";

import Logger from "@votewise/lib/logger";

import env from "@/src/env";

const host = env.SMTP_HOST;
const port = env.SMTP_PORT;
const username = env.SMTP_USERNAME;
const password = env.SMTP_PASSWORD;
const from = env.SMTP_FROM;
const fromMail = env.SMTP_FROM_EMAIL;

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
      const message = err instanceof Error ? err.message : "Failed to send email";
      Logger.error("EMAIL", message, { error: err });
      throw new Error("Failed to send email");
    }
  }
}
