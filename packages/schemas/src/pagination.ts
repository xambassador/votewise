import { z } from "zod";

export const ZPage = z.coerce
  .number()
  .default(1)
  .transform((val) => (val < 1 ? 1 : val));
export const ZLimit = z.coerce
  .number()
  .default(10)
  .transform((val) => (val < 1 ? 10 : val));
export const ZPagination = z.object({
  page: ZPage,
  limit: ZLimit
});

export type TPage = z.infer<typeof ZPage>;
export type TLimit = z.infer<typeof ZLimit>;
export type TPagination = z.infer<typeof ZPagination>;
