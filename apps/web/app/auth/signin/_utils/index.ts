import { z } from "zod";

const ZEmail = z.string().email({ message: "Email is required" });

export const ZSingInFormSchema = z.object({
  username: z
    .string({ required_error: "Username or email address is required" })
    .min(1, { message: "Username or email address is required" }),
  password: z.string({ message: "Password is required" }).email({ message: "Password is required" })
});

export type TSinginForm = z.infer<typeof ZSingInFormSchema>;

export function isEmail(value: string) {
  const validate = ZEmail.safeParse(value);
  if (validate.success) return true;
  return false;
}
