/* eslint-disable no-console */

import { z } from "zod";

function parseBooleanValue(val: string | undefined): boolean | Promise<boolean> {
  return val === "true" || val === "1" || val === "yes" || val === "y" || val === "Y";
}

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_VOTEWISE_API_PORT = 5000;
const DEFAULT_VOTEWISE_APP_PORT = 3000;
const DEFAULT_VOTEWISE_BUCKET_PORT = 5001;
const DEFAULT_BLOB_UPLOAD_LIMIT = 10 * 1024 * 1024; // 10 MB
const DEFAULT_APP_NAME = "Votewise";
const DEFAULT_AVATAR_BUCKET_NAME = "avatars";
const DEFAULT_BACKGROUND_BUCKET_NAME = "backgrounds";
const DEFAULT_UPLOAD_BUCKET_NAME = "uploads";
const DEFAULT_USE_SSL = false;

const ACCESS_TOKEN_SECRET = z
  .string({ required_error: "ACCESS_TOKEN is required" })
  .min(1, { message: "ACCESS_TOKEN is required" });
const REFRESH_TOKEN_SECRET = z
  .string({ required_error: "REFRESH_TOKEN is required" })
  .min(1, { message: "REFRESH_TOKEN is required" });
const APP_SECRET = z.string({ required_error: "APP_SECRET is required" }).min(1, { message: "APP_SECRET is required" });
const CRON_SECRET = z
  .string({ required_error: "CRON_SECRET is required" })
  .min(1, { message: "CRON_SECRET is required" });
const DATABASE_URL = z
  .string({ required_error: "DATABASE_URL is required" })
  .min(1, { message: "DATABASE_URL is required" })
  .refine((val) => val.startsWith("postgres://"), { message: "DATABASE_URL should be a valid URL" });
const REDIS_URL = z
  .string({
    required_error: "REDIS_URL is required"
  })
  .min(1, { message: "REDIS_URL is required" });
const REDIS_HOST = z.string().optional();
const REDIS_PORT = z.string().optional();
const NODE_ENV = z.enum(["development", "production", "test"]).default("development");
const VOTEWISE_API_PORT = z.string().default(DEFAULT_VOTEWISE_API_PORT.toString());
const VOTEWISE_APP_PORT = z.string().default(DEFAULT_VOTEWISE_APP_PORT.toString());
const VOTEWISE_BUCKET_PORT = z.string().default(DEFAULT_VOTEWISE_BUCKET_PORT.toString());
const VOTEWISE_BUCKET_NAME = z
  .string({ required_error: "VOTEWISE_BUCKET_NAME is required" })
  .min(1, { message: "VOTEWISE_BUCKET_NAME is required" });
const VOTEWISE_API_URL = z
  .string({
    required_error: "VOTEWISE_API_URL is required"
  })
  .min(1, { message: "VOTEWISE_API_URL is required" })
  .url({
    message: "VOTEWISE_API_URL should be a valid URL"
  });
const VOTEWISE_APP_URL = z
  .string({
    required_error: "VOTEWISE_APP_URL is required"
  })
  .min(1, { message: "VOTEWISE_APP_URL is required" })
  .url({
    message: "VOTEWISE_APP_URL should be a valid URL"
  });
const VOTEWISE_BUCKET_URL = z
  .string({
    required_error: "VOTEWISE_BUCKET_URL is required"
  })
  .min(1, { message: "VOTEWISE_BUCKET_URL is required" })
  .url({
    message: "VOTEWISE_BUCKET_URL should be a valid URL"
  });
const SMTP_HOST = z.string({ required_error: "SMTP_HOST is required" }).min(1, { message: "SMTP_HOST is required" });
const SMTP_PORT = z.string({ required_error: "SMTP_PORT is required" }).min(1, { message: "SMTP_PORT is required" });
const SMTP_USERNAME = z
  .string({ required_error: "SMTP_USERNAME is required" })
  .min(1, { message: "SMTP_USERNAME is required" });
const SMTP_PASSWORD = z
  .string({ required_error: "SMTP_PASSWORD is required" })
  .min(1, { message: "SMTP_PASSWORD is required" });
const SMTP_FROM = z.string({ required_error: "SMTP_FROM is required" }).min(1, { message: "SMTP_FROM is required" });
const SMTP_SECURE_ENABLED = z.string().default("true");
const REQUEST_TIMEOUT = z.string().default("30000");
const CONCURRENCY = z.string().default("1");
const SSL_KEY = z.string().optional();
const SSL_CERT = z.string().optional();
const MINIO_ACCESS_KEY = z
  .string({ required_error: "MINIO_ACCESS_KEY is required" })
  .min(1, { message: "MINIO_ACCESS is required" });
const MINIO_SECRET_KEY = z
  .string({ required_error: "MINIO_SECRET_KEY is required" })
  .min(1, { message: "MINIO_SECRET is required" });
const MINIO_ENDPOINT = z
  .string({ required_error: "MINIO_ENDPOINT is required" })
  .min(1, { message: "MINIO_ENDPOINT is required" });
const MINIO_PORT = z.string({ required_error: "MINIO_PORT is required" }).min(1, { message: "MINIO_PORT is required" });
const APP_COOKIE_SECRET = z
  .string({ required_error: "APP_COOKIE_SECRET is required" })
  .min(1, { message: "APP_COOKIE_SECRET is required" });
const API_COOKIE_SECRET = z
  .string({ required_error: "API_COOKIE_SECRET is required" })
  .min(1, { message: "API_COOKIE_SECRET is required" });
const ENABLE_CHAOS_MONKEY = z.string().default("false").optional().transform(parseBooleanValue);
const BLOB_UPLOAD_LIMIT = z
  .string()
  .default(DEFAULT_BLOB_UPLOAD_LIMIT.toString())
  .transform((val) => parseInt(val, 10));
const APP_NAME = z.string().default(DEFAULT_APP_NAME);
const AVATAR_BUCKET_NAME = z.string().default(DEFAULT_AVATAR_BUCKET_NAME);
const BACKGROUND_BUCKET_NAME = z.string().default(DEFAULT_BACKGROUND_BUCKET_NAME);
const UPLOAD_BUCKET_NAME = z.string().default(DEFAULT_UPLOAD_BUCKET_NAME);
const USE_SSL = z.string().default(DEFAULT_USE_SSL.toString()).transform(parseBooleanValue);
const VOTEWISE_ML_API_URL = z
  .string({
    required_error: "VOTEWISE_ML_API_URL is required"
  })
  .min(1, { message: "VOTEWISE_ML_API_URL is required" })
  .url({
    message: "VOTEWISE_ML_API_URL should be a valid URL"
  });
const IS_SANDBOX = z.string().default("false").transform(parseBooleanValue);

export const envBaseSchema = z.object({
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  APP_SECRET,
  CRON_SECRET,
  DATABASE_URL,
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  NODE_ENV,
  VOTEWISE_API_PORT,
  VOTEWISE_APP_PORT,
  VOTEWISE_BUCKET_PORT,
  VOTEWISE_API_URL,
  VOTEWISE_APP_URL,
  VOTEWISE_BUCKET_URL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_FROM,
  SMTP_SECURE_ENABLED,
  REQUEST_TIMEOUT,
  CONCURRENCY,
  SSL_KEY,
  SSL_CERT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_ENDPOINT,
  MINIO_PORT,
  APP_COOKIE_SECRET,
  API_COOKIE_SECRET,
  VOTEWISE_BUCKET_NAME,
  ENABLE_CHAOS_MONKEY,
  BLOB_UPLOAD_LIMIT,
  APP_NAME,
  AVATAR_BUCKET_NAME,
  BACKGROUND_BUCKET_NAME,
  UPLOAD_BUCKET_NAME,
  USE_SSL,
  VOTEWISE_ML_API_URL,
  IS_SANDBOX
});

export const envSchema = z.object({
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  APP_SECRET,
  CRON_SECRET,
  DATABASE_URL,
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT: REDIS_PORT.transform((val) => {
    if (!val) return DEFAULT_REDIS_PORT;
    return parseInt(val, 10);
  }),
  NODE_ENV,
  VOTEWISE_API_PORT: VOTEWISE_API_PORT.transform((val) => parseInt(val, 10)),
  VOTEWISE_APP_PORT: VOTEWISE_APP_PORT.transform((val) => parseInt(val, 10)),
  VOTEWISE_BUCKET_PORT: VOTEWISE_BUCKET_PORT.transform((val) => parseInt(val, 10)),
  VOTEWISE_API_URL,
  VOTEWISE_APP_URL,
  VOTEWISE_BUCKET_URL,
  SMTP_HOST,
  SMTP_PORT: SMTP_PORT.transform((val) => parseInt(val, 10)),
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_FROM,
  SMTP_SECURE_ENABLED: SMTP_SECURE_ENABLED.transform(parseBooleanValue),
  REQUEST_TIMEOUT: REQUEST_TIMEOUT.transform((val) => parseInt(val, 10)),
  CONCURRENCY: CONCURRENCY.transform((val) => parseInt(val, 10)),
  SSL_KEY,
  SSL_CERT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_ENDPOINT,
  MINIO_PORT: MINIO_PORT.transform((val) => parseInt(val, 10)),
  APP_COOKIE_SECRET,
  API_COOKIE_SECRET,
  VOTEWISE_BUCKET_NAME,
  ENABLE_CHAOS_MONKEY,
  BLOB_UPLOAD_LIMIT,
  APP_NAME,
  AVATAR_BUCKET_NAME,
  BACKGROUND_BUCKET_NAME,
  UPLOAD_BUCKET_NAME,
  USE_SSL,
  VOTEWISE_ML_API_URL,
  IS_SANDBOX
});

envSchema.superRefine((data) => {
  if (data.REDIS_PORT === DEFAULT_REDIS_PORT) {
    console.warn(`🟡 REDIS_PORT is set to default value ${DEFAULT_REDIS_PORT}`);
  }

  if (data.VOTEWISE_API_PORT === DEFAULT_VOTEWISE_API_PORT) {
    console.warn(`🟡 VOTEWISE_API_PORT is set to default value ${DEFAULT_VOTEWISE_API_PORT}`);
  }

  if (data.VOTEWISE_APP_PORT === DEFAULT_VOTEWISE_APP_PORT) {
    console.warn(`🟡 VOTEWISE_APP_PORT is set to default value ${DEFAULT_VOTEWISE_APP_PORT}`);
  }

  if (data.VOTEWISE_BUCKET_PORT === DEFAULT_VOTEWISE_BUCKET_PORT) {
    console.warn(`🟡 VOTEWISE_BUCKET_PORT is set to default value ${DEFAULT_VOTEWISE_BUCKET_PORT}`);
  }
});

export function validateEnv(env: unknown) {
  try {
    const res = envSchema.parse(env);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.errors.map((error) => "- " + error.message).join("\n");
      throw new Error(`\n🔴 Invalid environment variables\n\n${message}\n\n`);
    } else {
      throw new Error("Something went wrong while validating environment variables");
    }
  }
}

export type TEnv = z.infer<typeof envSchema>;
export type TBaseEnv = z.infer<typeof envBaseSchema>;

let environment: TEnv;

try {
  environment = validateEnv(process.env);
} catch (err) {
  // Silently fail this error, We will validate environment variables using validateEnv function
  environment = {} as TEnv;
}

export { environment };
