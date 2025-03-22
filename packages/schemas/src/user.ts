import { z } from "zod";

import { ZUsername } from "./auth";

// TODO: Remove this schema
export const ZUsernameExists = z.object({
  username: ZUsername
});
