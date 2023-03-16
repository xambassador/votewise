/* eslint-disable @typescript-eslint/no-namespace */
import type { User } from "@votewise/prisma/client";

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
