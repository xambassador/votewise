import { z } from "zod";

export const ZConnectYourSocials = z.object({
  location: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional()
});
export type TConnectYourSocials = z.infer<typeof ZConnectYourSocials>;

export const ZTellUsAboutYou = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "This field is required" }),
  about: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" })
});
export type TTellUsAboutYou = z.infer<typeof ZTellUsAboutYou>;

export const ZWhatShouldWeCall = z.object({
  userName: z.string({ required_error: "Username is required" }).min(3, { message: "Username is too short" }),
  firstName: z.string({ required_error: "First name is required" }).min(1, { message: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }).min(1, { message: "Last name is required" })
});
export type TWhatShouldWeCall = z.infer<typeof ZWhatShouldWeCall>;
