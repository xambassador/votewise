/* eslint-disable @typescript-eslint/no-namespace */

import type { User } from "@votewise/prisma/client";

import { z } from "zod";

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

const envSchema = z.object({
  JWT_SALT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_SALT_REFRESH_TOKEN_SECRET: z.string(),
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_FRONTEND_URL: z.string(),
  NEXT_PUBLIC_STATIC_SERVER_URL: z.string(),
  NEXT_PUBLIC_STATIC_UPLOAD_SERVER_URL: z.string(),
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),
  STATIC_SERVER_URL: z.string(),
  STATIC_UPLOAD_SERVER_URL: z.string(),
  COOKIE_ACCESS_TOKEN_KEY: z.string(),
  COOKIE_REFRESH_TOKEN_KEY: z.string(),
  COOKIE_IS_ONBOARDED_KEY: z.string(),
  STATIC_WEB_SERVER_PORT: z.string(),
  STATIC_UPLOAD_SERVER_PORT: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_URL: z.string(),
  CONCURRENCY: z.string(),
  SSL_KEY: z.string(),
  SSL_CERT: z.string(),
  REQUEST_TIMEOUT: z.string(),
  LOG_LEVEL: z.string(),
  DEBUG: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {
      NODE_ENV: "development" | "production" | "test";
    }
  }
}
