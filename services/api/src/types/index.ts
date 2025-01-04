/* eslint-disable @typescript-eslint/no-namespace */

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
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  amr: { method: string; timestamp: number }[];
  aal: "aal1" | "aal2";
  session_id: string;
  user_aal_level: "aal1" | "aal2";
};
export type TInMemorySession = { ip: string; userAgent: string; aal: "aal1" | "aal2" };
export type Locals = {
  meta: { ip: string };
  /**
   * The session stored in redis
   */
  session: TInMemorySession;
  /**
   * Parsed access token payload
   */
  payload: AccessTokenPayload;
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
