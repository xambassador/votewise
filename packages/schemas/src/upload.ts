import { z } from "zod";

export const ZHandshake = z.object({
  file_name: z.string({ required_error: "File name is required" }).min(1, { message: "File name is required" })
});

export type THandshake = z.infer<typeof ZHandshake>;
