import { z } from "zod";

export const ZStepOneFormSchema = z.object({
  userName: z.string({ required_error: "Username is required" }).min(3, { message: "Username is too short" }),
  firstName: z.string({ required_error: "First name is required" }).min(1, { message: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }).min(1, { message: "Last name is required" })
});

export type TStepOneForm = z.infer<typeof ZStepOneFormSchema>;
export type TStepOneFormKeys = keyof TStepOneForm;
