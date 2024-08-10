/* eslint-disable @typescript-eslint/no-namespace */

import type { envBaseSchema } from "@votewise/lib/environment";
import type { User } from "@votewise/prisma/client";
import type { z } from "zod";

type RemovePassword<T> = Omit<T, "password">;
type OriginalUser = RemovePassword<User>;

declare global {
  namespace Express {
    interface Request {
      session: {
        user: OriginalUser;
      };
      query: {
        limit?: number;
        offset?: number;
        token?: string;
        email?: string;
      };
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envBaseSchema> {}
  }
}
