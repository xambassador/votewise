export abstract class ITaskWorker {
  constructor() {}

  abstract process<TData>(data: TData): Promise<void>;
}

export type AssetType = "avatar" | "cover_image";
export type UploadToS3Job = {
  // Path to the file on the local filesystem
  filePath: string;
  // Path to the file in S3
  path: string;
  userId: string;
  assetType: AssetType;
};
export type UploadCompletedEventJob = { userId: string; path: string; assetType: AssetType };
export type UploadToS3Task = { name: "uploadToS3"; payload: UploadToS3Job };
export type UploadCompletedEventTask = { name: "uploadCompletedEvent"; payload: UploadCompletedEventJob };

export type JobType = "email";

type BaseData = {
  to: string;
  subject: string;
};
type BaseLocals = { logo: string };
type SignupTemplate = BaseData & {
  templateName: "signup";
  locals: {
    otp: string;
    expiresIn: number;
    expiresInUnit: string;
  } & BaseLocals;
};
type WelcomeTemplate = BaseData & { templateName: "welcome"; locals: { name: string } & BaseLocals };
type ForgotPasswordTemplate = BaseData & {
  templateName: "forgot-password";
  locals: {
    firstName: string;
    expiresIn: number;
    expiresInUnit: "hours" | "minutes";
    email: string;
    resetLink: string;
  } & BaseLocals;
};
type PasswordResetSuccessTemplate = BaseData & {
  templateName: "password-reset-success";
  locals: { name: string; loginUrl: string } & BaseLocals;
};
export type EmailJob = SignupTemplate | WelcomeTemplate | ForgotPasswordTemplate | PasswordResetSuccessTemplate;
export type Tasks = { name: "email"; payload: EmailJob };
