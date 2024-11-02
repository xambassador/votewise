/* eslint-disable @typescript-eslint/no-namespace */

import type { Payload as AccessTokenData } from "@/services/jwt.service";
import type { envBaseSchema } from "@votewise/env";
import type { z } from "zod";

export type AuthenticatedUser = {
  ip: string;
  user_agent?: string;
  is_2fa_enabled: "true" | "false";
  is_2fa_verified: "true" | "false";
  email: string;
  username: string;
};
export type Locals = {
  meta: { ip: string };
  session: { user: AuthenticatedUser; accessToken: AccessTokenData };
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
