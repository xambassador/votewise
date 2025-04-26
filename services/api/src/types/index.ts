/* eslint-disable @typescript-eslint/no-namespace */

import type { envBaseSchema } from "@votewise/env";
import type { AccessTokenPayload } from "@votewise/types";
import type { z } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envBaseSchema> {}
  }
}

declare global {
  interface InMemorySession {
    ip: string;
    userAgent: string;
    aal: "aal1" | "aal2";
  }

  interface Locals {
    meta: { ip: string };
    /**
     * The session stored in redis
     */
    session: InMemorySession;
    /**
     * Parsed access token payload
     */
    payload: AccessTokenPayload;
  }
}
