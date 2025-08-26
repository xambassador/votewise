import { z } from "zod";

export const ZGroupCreate = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string"
    })
    .min(1, { message: "Name is required" })
    .max(21, { message: "Name must be less than 21 characters" }),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string"
    })
    .min(1, { message: "Description is required" })
    .max(500, { message: "Description must be less than 500 characters" }),
  type: z.enum(["PUBLIC", "PRIVATE"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be either PUBLIC or PRIVATE"
  }),
  cover_image_url: z.string().url().optional()
});

export type TGroupCreate = z.infer<typeof ZGroupCreate>;
