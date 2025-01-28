import type { SignOptions } from "jsonwebtoken";

import { decode, sign, TokenExpiredError, verify } from "jsonwebtoken";

type Codes = "TOKEN_EXPIRED" | "MALFORMED_TOKEN";
type VerifyResult<T> = { success: true; data: T } | { success: false; error: Codes };
type JWTOptions = { accessTokenSecret: string };
export type { SignOptions };

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

export class JWT {
  private readonly accessTokenSecret: string;

  constructor(opts: JWTOptions) {
    this.accessTokenSecret = opts.accessTokenSecret;
  }

  /**
   * Verify the access token
   *
   * @param {string} token JSON Web Token string
   * @returns {VerifyResult<AccessTokenPayload>} Result of the verification
   */
  public verifyAccessToken(token: string): VerifyResult<AccessTokenPayload> {
    try {
      const data = verify(token, this.accessTokenSecret) as AccessTokenPayload;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.handleError(err) };
    }
  }

  /**
   * Create new JWT access token from the payload
   *
   * @param {AccessTokenPayload} payload Payload or data that need to convert into a JSON Web Token string payload
   * @param {SignOptions} options Options for the token
   * @returns {string} JSON Web Token string
   */
  public signAccessToken(payload: AccessTokenPayload, options?: SignOptions): string {
    return sign(payload, this.accessTokenSecret, options);
  }

  public decodeAccessToken(token: string): AccessTokenPayload | null {
    return decode(token) as AccessTokenPayload | null;
  }

  public sign(payload: string | Buffer | object, key: string, options?: SignOptions): string {
    return sign(payload, key, options);
  }

  public verify<T>(token: string, key: string): VerifyResult<T> {
    try {
      const data = verify(token, key) as T;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.handleError(err) };
    }
  }

  public decode<T>(token: string): T | null {
    return decode(token) as T | null;
  }

  private handleError(err: unknown): Codes {
    if (err instanceof TokenExpiredError) {
      return "TOKEN_EXPIRED";
    }
    return "MALFORMED_TOKEN";
  }
}
