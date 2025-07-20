import { z } from "zod";

import { ZUsername } from "./auth";

// TODO: Remove this schema
export const ZUsernameExists = z.object({
  username: ZUsername
});

export const ZRecommendUserQuery = z.object({
  top_n: z.coerce.number().optional()
});

export type TRecommendUserQuery = z.infer<typeof ZRecommendUserQuery>;
