import type { AppContext } from "@/context";
import type { ITaskWorker } from "..";

import path from "node:path";
import pug from "pug";

type BaseData = {
  to: string;
  subject: string;
};
type SignupTemplate = BaseData & { templateName: "signup"; locals: { otp: string } };
type WelcomeTemplate = BaseData & { templateName: "welcome"; locals: { userName: string } };
type ForgotPasswordTemplate = BaseData & {
  templateName: "forgot-password";
  locals: {
    firstName: string;
    expiresIn: number;
    expiresInUnit: "hours" | "minutes";
    email: string;
    resetLink: string;
    logo: string;
  };
};
export type EmailJob = SignupTemplate | WelcomeTemplate | ForgotPasswordTemplate;

type EmailProcessorOptions = {
  logger: AppContext["logger"];
  mailer: AppContext["mailer"];
  userRepository: AppContext["repositories"]["user"];
};

export class EmailProcessor implements ITaskWorker {
  private readonly opts: EmailProcessorOptions;
  private readonly compiledTemplates: { [key: string]: pug.compileTemplate } = {};

  constructor(opts: EmailProcessorOptions) {
    this.opts = opts;
  }

  async process<TData>(data: TData): Promise<void> {
    const emailData = data as EmailJob;
    const { templateName, to, locals, subject } = emailData;
    this.opts.logger.info(`Sending email to ${emailData.to}`);
    const templatePath = path.resolve(__dirname, `../../emails/templates/${templateName}.pug`);
    const template = this.compiledTemplates[emailData.templateName] || pug.compileFile(templatePath);
    const html = template(locals);
    try {
      await this.opts.mailer.send({
        html,
        to,
        subject
      });
      this.opts.logger.info(`Email sent to ${to}`);
      await this.opts.userRepository.updateByEmail(to, { email_confirmation_sent_at: new Date() });
    } catch (err) {
      this.opts.logger.error(`Failed to send email to ${to}`);
      throw err;
    }
  }
}
