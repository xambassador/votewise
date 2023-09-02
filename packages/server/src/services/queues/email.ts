import Queue from "bull";
import dotenv from "dotenv";

import Logger from "@votewise/lib/logger";

import { EmailTransporter } from "@/src/services/email/EmailTransporter";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redis = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
};

type EmailData = {
  to: string;
  subject: string;
  html: string;
};

const registrationEmailQueue = new Queue<EmailData>("registrationEmail", {
  redis,
});

const passwordResetEmailQueue = new Queue<EmailData>("passwordResetEmail", {
  redis,
});

const notificationMailQueue = new Queue<EmailData>("notificationMail", {
  redis,
});

passwordResetEmailQueue.on("completed", (job) => {
  Logger.info("QUEUE", "Password reset email sent.", { id: job.id });
  job.remove();
});

registrationEmailQueue.on("completed", (job) => {
  Logger.info("QUEUE", "Registration email sent.", { id: job.id });
  job.remove();
});

notificationMailQueue.on("completed", (job) => {
  Logger.info("QUEUE", "Notification email sent.", { id: job.id });
  job.remove();
});

async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = new EmailTransporter({
    to,
    subject,
    html,
  });
  try {
    await transport.send();
  } catch (err) {
    Logger.error("QUEUE", "Error sending email.", { err });
  }
}

registrationEmailQueue.process(async (job, done) => {
  Logger.info("PROCESSOR", "processing registration email.", { id: job.id });
  await sendMail(job.data);
  done();
});

passwordResetEmailQueue.process(async (job, done) => {
  Logger.info("PROCESSOR", "processing password reset email.", { id: job.id });
  await sendMail(job.data);
  done();
});

notificationMailQueue.process(async (job, done) => {
  Logger.info("PROCESSOR", "processing notification email.", { id: job.id });
  await sendMail(job.data);
  done();
});

export { registrationEmailQueue, passwordResetEmailQueue, notificationMailQueue };
