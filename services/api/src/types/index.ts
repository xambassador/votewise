/* eslint-disable @typescript-eslint/no-namespace */

import type { envBaseSchema } from "@votewise/lib/environment";
import type { User } from "@votewise/prisma/client";
import type { z } from "zod";

export type Locals = {
  meta: {
    ip: string;
  };
  user: User;
};

declare global {
  namespace Express {
    interface Request {
      query: {
        limit?: number;
        offset?: number;
        token?: string;
        email?: string;
      };
    }

    interface Response {
      locals: Locals;
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envBaseSchema> {}
  }
}
