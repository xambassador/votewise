import { z } from "zod";

const ZText = z
  .string({ required_error: "text is required" })
  .min(2, { message: "text must be at least 2 characters long" })
  .max(300, { message: "text must be at most 300 characters long" });

export const ZCommentCreate = z.object({
  text: ZText,
  parent_id: z.string({ invalid_type_error: "parent_id must be a string" }).optional()
});

export const ZCommentUpdate = z.object({ text: ZText });

export type TCommentCreate = z.infer<typeof ZCommentCreate>;
export type TCommentUpdate = z.infer<typeof ZCommentUpdate>;
