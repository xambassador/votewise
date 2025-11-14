import { z } from "zod";

import { ZFirstName, ZLastName } from "./auth";

export const ZRecommendUserQuery = z.object({
  top_n: z.coerce.number().optional()
});

export const ZUpdateProfile = z.object({
  first_name: ZFirstName,
  last_name: ZLastName,
  about: z
    .string({ required_error: "about is required" })
    .min(1, { message: "about is required" })
    .max(256, { message: "about must be less than 256 characters" }),
  avatar: z.string({ required_error: "avatar is required" }).min(1, { message: "avatar is required" }),
  cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover is required" })
});

export type TRecommendUserQuery = z.infer<typeof ZRecommendUserQuery>;
export type TUpdateProfile = z.infer<typeof ZUpdateProfile>;
