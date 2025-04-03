import { z } from "zod";

export const ZFeedCreate = z.object({
  title: z
    .string({ message: "title is required" })
    .min(1, { message: "title is required" })
    .max(255, { message: "title must be less than 255 characters" }),
  content: z.string({ message: "content is required" }).min(1, { message: "content is required" })
});
