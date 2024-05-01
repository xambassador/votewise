import { z } from "zod";

export const ZPassword = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(8, {
    message: "Password must be at least 8 characters long",
  });
export type TPassword = z.infer<typeof ZPassword>;

export const ZEmail = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .email({
    message: "Invalid email address",
  });
export type TEmail = z.infer<typeof ZEmail>;

export const ZUsername = z
  .string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  })
  .optional();
export type TUsername = z.infer<typeof ZUsername>;

export const ZRegisterUser = z.object({
  password: ZPassword,
  email: ZEmail,
});
export type TRegisterUser = z.infer<typeof ZRegisterUser>;

export const ZLogin = z.object({
  username: ZUsername,
  email: ZEmail.optional(),
  password: ZPassword,
});
export type TLogin = z.infer<typeof ZLogin>;
