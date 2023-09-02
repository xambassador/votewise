import { IsByteLength, IsIn, IsNotEmpty, IsNumber, IsOptional, IsUrl, validate } from "class-validator";
import dotenv from "dotenv";

import { CannotUseWithout } from "@/src/utils/decorators";

dotenv.config();

export class Environment {
  private validationPromise;

  @IsIn(["development", "production", "test", "staging", "qa"])
  public ENVIRONMENT = process.env.NODE_ENV ?? "production";

  @IsByteLength(32, 64)
  public ACCESS_TOKEN_SECRET = process.env.JWT_SALT_ACCESS_TOKEN_SECRET ?? "";

  @IsByteLength(32, 64)
  public REFRESH_TOKEN_SECRET = process.env.JWT_SALT_REFRESH_TOKEN_SECRET ?? "";

  @IsNotEmpty()
  @IsUrl({
    require_tld: false,
    allow_underscores: true,
    protocols: ["postgres", "postgresql"],
  })
  public DATABASE_URL = process.env.DATABASE_URL ?? "";

  @IsNotEmpty()
  public REDIS_URL = process.env.REDIS_URL ?? "";

  @IsNotEmpty()
  public FRONTEND_URL = process.env.FRONTEND_URL ?? "";

  @IsNotEmpty()
  public BACKEND_URL = process.env.BACKEND_URL ?? "";

  @IsNotEmpty()
  public STATIC_SERVER_URL = process.env.STATIC_SERVER_URL ?? "";

  @IsNotEmpty()
  public STATIC_UPLOAD_SERVER_URL = process.env.STATIC_UPLOAD_SERVER_URL ?? "";

  @IsNotEmpty()
  public COOKIE_ACCESS_TOKEN_KEY = process.env.COOKIE_ACCESS_TOKEN_KEY ?? "";

  @IsNotEmpty()
  public COOKIE_REFRESH_TOKEN_KEY = process.env.COOKIE_REFRESH_TOKEN_KEY ?? "";

  /** Base64 encoded private key. */
  @IsOptional()
  @CannotUseWithout("SSL_CERT")
  public SSL_KEY = this.toOptionalString(process.env.SSL_KEY);

  /** Base64 encoded public certificate. */
  @IsOptional()
  @CannotUseWithout("SSL_KEY")
  public SSL_CERT = this.toOptionalString(process.env.SSL_CERT);

  @IsNotEmpty()
  public SMTP_HOST = process.env.SMTP_HOST ?? "";

  @IsNotEmpty()
  @IsNumber()
  public SMTP_PORT = this.toOptionalNumber(process.env.SMTP_PORT);

  public SMTP_USERNAME = process.env.SMTP_USERNAME ?? "votewise.admin@gmail.com";

  public SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? "votewise";

  public SMTP_FROM = process.env.SMTP_FROM ?? "votewise";

  public SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL ?? "votewise.app@gmail.com";

  /**
   * How many processes should be spawned. As a reasonable rule divide your
   * server's available memory by 512 for a rough estimate
   */
  @IsNumber()
  @IsOptional()
  public CONCURRENCY = this.toOptionalNumber(process.env.WEB_CONCURRENCY);

  public REQUEST_TIMEOUT = this.toOptionalNumber(process.env.REQUEST_TIMEOUT) ?? 10 * 1000; // 10 seconds

  public APP_NAME = "Votewise";

  constructor() {
    this.validationPromise = validate(this);
  }

  public validate() {
    return this.validationPromise;
  }

  private toOptionalString(value: string | undefined) {
    return value === undefined ? undefined : value;
  }

  private toOptionalNumber(value: string | undefined) {
    return value === undefined ? undefined : parseInt(value, 10);
  }
}

const env = new Environment();

export default env;
