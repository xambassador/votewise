import { z } from "zod";

export const ZPage = z.coerce
  .number()
  .default(1)
  .transform((val) => (val < 1 ? 1 : val));
export const ZLimit = z.coerce.number().default(-1); // Let the controller decide the limit
export const ZCursor = z.string().optional();
export const ZPagination = z.object({
  page: ZPage,
  limit: ZLimit,
  cursor: ZCursor
});

export type TPage = z.infer<typeof ZPage>;
export type TLimit = z.infer<typeof ZLimit>;
export type TPagination = Partial<z.infer<typeof ZPagination>>;
