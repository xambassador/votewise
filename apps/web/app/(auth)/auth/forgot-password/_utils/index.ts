import { z } from "zod";

export const ZForgotPasswordForm = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" })
});

export type TForgotPasswordForm = z.infer<typeof ZForgotPasswordForm>;
export type TForgotPasswordFormKeys = keyof TForgotPasswordForm;
