import { z } from "zod";

export const ZEmail = z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" });
export const ZPassword = z
  .string({ required_error: "Password is required" })
  .min(6, { message: "Password must be at least 6 characters" });
export const ZUsername = z
  .string({ required_error: "Username is required" })
  .min(3, { message: "Username must be at least 3 characters" });
export const ZFirstName = z
  .string({ required_error: "First name is required" })
  .min(2, { message: "First name must be at least 2 characters" });
export const ZLastName = z
  .string({ required_error: "Last name is required" })
  .min(2, { message: "Last name must be at least 2 characters" });

export const ZRegister = z.object({
  email: ZEmail,
  password: ZPassword,
  username: ZUsername,
  first_name: ZFirstName,
  last_name: ZLastName
});

export type TRegister = z.infer<typeof ZRegister>;
export type TEmail = z.infer<typeof ZEmail>;
export type TPassword = z.infer<typeof ZPassword>;
