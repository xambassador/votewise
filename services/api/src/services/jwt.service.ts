import type { SignOptions } from "jsonwebtoken";

import { sign, TokenExpiredError, verify } from "jsonwebtoken";

type JWTServiceOptions = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
};

type Codes = "TOKEN_EXPIRED" | "MALFORMED_TOKEN";
type VerifyResult<T> = { success: true; data: T } | { success: false; error: Codes };

export type Payload = { user_id: string; is_email_verified: boolean; session_id: string };

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(ots: JWTServiceOptions) {
    this.accessTokenSecret = ots.accessTokenSecret;
    this.refreshTokenSecret = ots.refreshTokenSecret;
  }

  /**
   * Create new JWT access token from the payload
   *
   * @param {Payload} payload Payload or data that need to convert into a JSON Web Token string payload
   * @param {SignOptions} options Options for the token
   * @returns {string} JSON Web Token string
   */
  public signAccessToken(payload: Payload, options?: SignOptions): string {
    return sign(payload, this.accessTokenSecret, options);
  }

  /**
   * Create new JWT refresh token from the payload
   *
   * @param {string | object} payload Payload or data that need to convert into a JSON Web Token string payload
   * @param {SignOptions} options Options for the token
   * @returns {string} JSON Web Token string
   */
  public signRefreshToken(payload: { user_id: string }, options?: SignOptions): string {
    return sign(payload, this.refreshTokenSecret, options);
  }

  /**
   * Verify the access token
   *
   * @param {string} token JSON Web Token string
   * @returns {VerifyResult<T>} Result of the verification
   * @template T
   */
  public verifyAccessToken<T>(token: string): VerifyResult<T> {
    try {
      const data = verify(token, this.accessTokenSecret) as T;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.handleError(err) };
    }
  }

  /**
   * Verify the refresh token
   *
   * @param {string} token JSON Web Token string
   * @returns {VerifyResult<T>} Result of the verification
   * @template T
   */
  public verifyRefreshToken<T>(token: string): VerifyResult<T> {
    try {
      const data = verify(token, this.refreshTokenSecret) as T;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.handleError(err) };
    }
  }

  private handleError(err: unknown): Codes {
    if (err instanceof TokenExpiredError) {
      return "TOKEN_EXPIRED";
    }
    return "MALFORMED_TOKEN";
  }
}
