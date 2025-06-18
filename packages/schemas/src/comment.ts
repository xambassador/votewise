import { z } from "zod";

export const ZCommentCreate = z.object({
  text: z.string({ required_error: "text is required" }).min(2, { message: "text must be at least 2 characters long" }),
  parent_id: z.string({ invalid_type_error: "parent_id must be a string" }).optional()
});

export type TCommentCreate = z.infer<typeof ZCommentCreate>;
