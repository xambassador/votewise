import { z } from "zod";

import { ZEmail, ZFirstName, ZLastName, ZUsername } from "./auth";

export const ZRecommendUserQuery = z.object({
  top_n: z.coerce.number().optional()
});

const ZAbout = z
  .string({ required_error: "about is required" })
  .min(1, { message: "about is required" })
  .max(256, { message: "about must be less than 256 characters" });

export const ZUpdateProfile = z.object({
  id: z.string({ required_error: "id is required" }).min(1, { message: "id is required" }),
  first_name: ZFirstName,
  last_name: ZLastName,
  about: ZAbout,
  avatar: z.string({ required_error: "avatar is required" }).min(1, { message: "avatar is required" }),
  cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover is required" })
});

function isValidUrlOrEmpty(val: string | undefined): boolean {
  if (!val) return true;
  if (val.trim() === "") return true;
  return z.string().url().safeParse(val).success;
}

export const ZUpdateAccount = z.object({
  email: ZEmail,
  username: ZUsername,
  first_name: ZFirstName,
  last_name: ZLastName,
  about: ZAbout,
  location: z
    .string({ required_error: "This field is required" })
    .min(1, { message: "This field is required" })
    .max(100, { message: "Location must be less than 100 characters" }),
  facebook: z.string().optional().refine(isValidUrlOrEmpty, { message: "Facebook URL must be a valid URL" }),
  instagram: z.string().optional().refine(isValidUrlOrEmpty, { message: "Instagram URL must be a valid URL" }),
  twitter: z.string().optional().refine(isValidUrlOrEmpty, { message: "Twitter URL must be a valid URL" })
});

export type TRecommendUserQuery = z.infer<typeof ZRecommendUserQuery>;
export type TUpdateProfile = z.infer<typeof ZUpdateProfile>;
export type TUpdateAccount = z.infer<typeof ZUpdateAccount>;
