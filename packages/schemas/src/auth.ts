import { z } from "zod";

export const ZEmail = z
  .string({ required_error: "email is missing", invalid_type_error: "email must be a string" })
  .email({ message: "Invalid email address" });
export const ZPassword = z
  .string({ required_error: "password is missing", invalid_type_error: "password must be a string" })
  .min(6, { message: "password must be at least 6 characters" });
export const ZUsername = z
  .string({ required_error: "username is required", invalid_type_error: "username must be a string" })
  .min(3, { message: "username must be at least 3 characters" });
export const ZFirstName = z
  .string({ required_error: "first_name is required", invalid_type_error: "first_name must be a string" })
  .min(2, { message: "first_name must be at least 2 characters" });
export const ZLastName = z
  .string({ required_error: "last_name is required", invalid_type_error: "last_name must be a string" })
  .min(2, { message: "last_name must be at least 2 characters" });
export const ZVerificationCode = z
  .string({ required_error: "verification_code is missing", invalid_type_error: "verification_code must be a string" })
  .min(1, { message: "verification_code is missing" });
export const ZOtp = z.number({ required_error: "otp is missing", invalid_type_error: "otp must be a number" });
export const ZUserId = z
  .string({ required_error: "user_id is missing", invalid_type_error: "user_id must be a string" })
  .min(1, { message: "user_id is missing" });
export const ZAccessToken = z
  .string({
    required_error: "access_token is missing",
    invalid_type_error: "access_token must be a string"
  })
  .min(1, { message: "access_token is missing" });
export const ZRefreshToken = z
  .string({
    required_error: "refresh_token is missing",
    invalid_type_error: "refresh_token must be a string"
  })
  .min(1, { message: "refresh_token is missing" });

export const ZRegister = z.object({
  email: ZEmail,
  password: ZPassword,
  username: ZUsername,
  first_name: ZFirstName,
  last_name: ZLastName
});

export const ZVerifyEmail = z.object({
  email: ZEmail,
  verification_code: ZVerificationCode,
  otp: ZOtp,
  user_id: ZUserId
});

export const ZSignin = z
  .object({
    password: ZPassword,
    email: ZEmail.optional(),
    username: ZUsername.optional()
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "email or username is required",
        fatal: true,
        path: ["email", "username"]
      });
      return z.NEVER;
    }

    return data;
  });

export const ZRefresh = z.object({
  access_token: ZAccessToken,
  refresh_token: ZRefreshToken
});

export const ZForgotPassword = z.object({
  email: ZEmail
});

export const ZResetPassword = z.object({
  password: ZPassword,
  email: ZEmail
});
export const ZResetPasswordQuery = z.object({
  token: z
    .string({ required_error: "token is missing", invalid_type_error: "token must be a string" })
    .min(1, { message: "token is missing" })
});

export type TRegister = z.infer<typeof ZRegister>;
export type TEmail = z.infer<typeof ZEmail>;
export type TPassword = z.infer<typeof ZPassword>;
export type TVerifyEmail = z.infer<typeof ZVerifyEmail>;
export type TSignin = z.infer<typeof ZSignin>;
export type TRefresh = z.infer<typeof ZRefresh>;
export type TForgotPassword = z.infer<typeof ZForgotPassword>;
export type TResetPassword = z.infer<typeof ZResetPassword>;
export type TResetPasswordQuery = z.infer<typeof ZResetPasswordQuery>;
