import { z } from "zod";

import { ZFirstName, ZLastName, ZUsername } from "./auth";

export const ZOnboard = z.object({
  user_name: ZUsername,
  first_name: ZFirstName,
  last_name: ZLastName,
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Invalid gender" }),
  about: z.string({ required_error: "about is missing" }).min(10, { message: "about is too short" }),
  avatar_url: z.string({ required_error: "avatar_url is missing" }).url({ message: "Invalid avatar_url" }),
  cover_url: z.string({ required_error: "cover_url is missing" }).url({ message: "Invalid cover_url" }),
  location: z.string({ required_error: "location is missing" }).min(3, { message: "location is too short" }),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  twitter_url: z.string().optional(),
  topics: z.array(z.string()).min(3, { message: "Please select at least 3 topics" })
});

export type TOnboard = z.infer<typeof ZOnboard>;
