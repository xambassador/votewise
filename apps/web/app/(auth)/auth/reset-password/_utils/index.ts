import { z } from "zod";

export const ZResetPasswordSchema = z.object({
  password: z.string({ message: "Password is required" }).min(1, { message: "Password is required" })
});

export type TResetPasswordForm = z.infer<typeof ZResetPasswordSchema>;
export type TResetPasswordFormKeys = keyof TResetPasswordForm;
