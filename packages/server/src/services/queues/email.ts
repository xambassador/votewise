import Queue from "bull";
import dotenv from "dotenv";

import { logger } from "../../utils";
import { EmailTransporter } from "../email/EmailTransporter";

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
  logger(`${job.id} successfullt completed... Removing from Queue`);
  job.remove();
});

registrationEmailQueue.on("completed", (job) => {
  logger(`${job.id} is completed.... Removing from queue`);
  job.remove();
});

notificationMailQueue.on("completed", (job) => {
  logger(`${job.id} is completed.... Removing from queue`);
  job.remove();
});

async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = new EmailTransporter({
    to,
    subject,
    html,
  });
  await transport.send();
}

registrationEmailQueue.process(async (job, done) => {
  logger(`Processing registration email job ${job.id}...`);
  await sendMail(job.data);
  done();
});

passwordResetEmailQueue.process(async (job, done) => {
  logger(`Processing password reset email job ${job.id}...`);
  await sendMail(job.data);
  done();
});

notificationMailQueue.process(async (job, done) => {
  logger(`Processing notification email job ${job.id}...`);
  await sendMail(job.data);
  done();
});

export { registrationEmailQueue, passwordResetEmailQueue, notificationMailQueue };
