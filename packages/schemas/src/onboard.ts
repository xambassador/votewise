import { z } from "zod";

import { ZFirstName, ZLastName, ZUsername } from "./auth";

export const ZWhatShouldWeCall = z.object({
  step: z.literal(1),
  user_name: ZUsername,
  first_name: ZFirstName,
  last_name: ZLastName
});

export const ZTellUsAboutYou = z.object({
  step: z.literal(2),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "gender is required" }),
  about: z.string({ required_error: "about is required" }).min(1, { message: "about is required" })
});

export const ZYourPhotoShine = z.object({
  step: z.literal(3),
  avatar: z.string({ required_error: "avatar is required" }).min(1, { message: "avatar is required" })
});

export const ZYourProfileStandOut = z.object({
  step: z.literal(4),
  cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover is required" })
});

export const ZConnectYourSocials = z.object({
  step: z.literal(5),
  location: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional()
});

export const ZChooseYourTopics = z.object({
  step: z.literal(6),
  topics: z.array(z.string()).min(3, { message: "Please select at least 3 topics" })
});

export const ZSecureYourAccount = z.object({
  step: z.literal(7),
  has_setup_2fa: z.boolean().default(false)
});

export const ZOnboard = z.discriminatedUnion(
  "step",
  [
    ZWhatShouldWeCall,
    ZTellUsAboutYou,
    ZYourPhotoShine,
    ZYourProfileStandOut,
    ZConnectYourSocials,
    ZChooseYourTopics,
    ZSecureYourAccount
  ],
  {
    errorMap: (issue, ctx) => {
      if (issue.code === "invalid_union_discriminator") {
        if (!ctx.data) {
          return { message: "Invalid request. Body is required" };
        }
        return { message: "Invalid step value. step can be 1, 2, 3, 4, 5, 6" };
      }
      return { message: ctx.defaultError };
    }
  }
);

export type TOnboard = z.infer<typeof ZOnboard>;
export type TWhatShouldWeCall = z.infer<typeof ZWhatShouldWeCall>;
export type TTellUsAboutYou = z.infer<typeof ZTellUsAboutYou>;
export type TConnectYourSocials = z.infer<typeof ZConnectYourSocials>;
export type TChooseYourTopics = z.infer<typeof ZChooseYourTopics>;
export type TYourPhotoShine = z.infer<typeof ZYourPhotoShine>;
export type TYourProfileStandOut = z.infer<typeof ZYourProfileStandOut>;
export type TSecureYourAccount = z.infer<typeof ZSecureYourAccount>;
