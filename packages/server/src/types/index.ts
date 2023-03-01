/* eslint-disable @typescript-eslint/no-namespace */
import type { User } from "@votewise/prisma/client";

declare global {
  namespace Express {
    interface Request {
      session: {
        user: User;
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
