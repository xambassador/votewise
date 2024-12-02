import { z } from "zod";

import { checkStrength } from "@votewise/ui/password-strength";

export const ZSignUpForm = z
  .object({
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string({ required_error: "Password is required" })
  })
  .superRefine((data, ctx) => {
    if (!data.password) {
      ctx.addIssue({
        message: "Password is required",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["password"]
      });
      return z.NEVER;
    }

    const strength = checkStrength(data.password);
    const isValid =
      strength.hasLength && strength.hasLowerCase && strength.hasUpperCase && strength.hasNumber && strength.hasSpecial;
    if (!isValid) {
      ctx.addIssue({
        message: "Password is too weak",
        code: z.ZodIssueCode.custom,
        fatal: true,
        path: ["password"]
      });
      return z.NEVER;
    }
    return data;
  });

export type TSignUpForm = z.infer<typeof ZSignUpForm>;
export type TSignUpFormKeys = keyof TSignUpForm;
