import { logger } from "@votewise/lib/logger";

import {
  notificationMailQueue,
  passwordResetEmailQueue,
  registrationEmailQueue,
} from "@/src/services/queues";

type EmailOption = {
  to: string;
  subject: string;
  html: string;
};

export default class EmailService {
  public data: EmailOption;

  private emailType: "REGISTRATION_MAIL" | "FORGOT_MAIL" | "NOTIFICATION_MAIL";

  constructor(data: EmailOption, type: "REGISTRATION_MAIL" | "FORGOT_MAIL" | "NOTIFICATION_MAIL") {
    this.data = data;
    this.emailType = type;
  }

  async addToQueue() {
    switch (this.emailType) {
      case "REGISTRATION_MAIL":
        try {
          await registrationEmailQueue.add(this.data);
        } catch (err) {
          logger(err);
        }
        break;

      case "FORGOT_MAIL":
        try {
          await passwordResetEmailQueue.add(this.data);
        } catch (err) {
          logger(err);
        }
        break;

      case "NOTIFICATION_MAIL":
        try {
          await notificationMailQueue.add(this.data);
        } catch (err) {
          logger(err);
        }
        break;

      default:
        throw new Error(`Unknown type ${this.emailType}`);
    }
  }
}
