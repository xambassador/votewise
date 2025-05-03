/* eslint-disable @typescript-eslint/no-namespace */

import type { envBaseSchema, TEnv } from "@votewise/env";
import type { AccessTokenPayload } from "@votewise/types";
import type { z } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envBaseSchema> {}
  }
}

declare global {
  interface Locals {
    /**
     * Parsed access token payload
     */
    payload: AccessTokenPayload;
  }

  interface Environment extends TEnv {}
}
