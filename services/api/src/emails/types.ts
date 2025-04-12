type BaseData = { to: string; subject: string };
type BaseLocals = { logo: string };
export type SignupTemplate = BaseData & {
  templateName: "signup";
  locals: {
    otp: string;
    expiresIn: number;
    expiresInUnit: string;
  } & BaseLocals;
};
export type WelcomeTemplate = BaseData & {
  templateName: "welcome";
  locals: { name: string; featuredContent: { title: string; description: string }[] } & BaseLocals;
};
export type ForgotPasswordTemplate = BaseData & {
  templateName: "forgot-password";
  locals: {
    firstName: string;
    expiresIn: number;
    expiresInUnit: "hours" | "minutes";
    email: string;
    resetLink: string;
  } & BaseLocals;
};
export type PasswordResetSuccessTemplate = BaseData & {
  templateName: "password-reset-success";
  locals: { name: string; loginUrl: string } & BaseLocals;
};
