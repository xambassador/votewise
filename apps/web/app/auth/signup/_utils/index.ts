import { z } from "zod";

import { checkStrength } from "@votewise/ui/password-strength";

export const ZStepOneFormSchema = z
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

export const ZStepTwoFormSchema = z.object({
  userName: z.string({ required_error: "Username is required" }).min(3, { message: "Username is too short" }),
  firstName: z.string({ required_error: "First name is required" }).min(1, { message: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }).min(1, { message: "Last name is required" })
});

export type TStepOneForm = z.infer<typeof ZStepOneFormSchema>;
export type TStepOneFormKeys = keyof TStepOneForm;
export type TStepTwoForm = z.infer<typeof ZStepTwoFormSchema>;
export type TStepTwoFormKeys = keyof TStepTwoForm;
