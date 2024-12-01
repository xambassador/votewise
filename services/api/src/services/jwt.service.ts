import type { AccessTokenPayload } from "@/types";
import type { SignOptions } from "jsonwebtoken";

import { decode, sign, TokenExpiredError, verify } from "jsonwebtoken";

type JWTServiceOptions = {
  accessTokenSecret: string;
};

type Codes = "TOKEN_EXPIRED" | "MALFORMED_TOKEN";
type VerifyResult<T> = { success: true; data: T } | { success: false; error: Codes };

export type RidPayload = { verification_code: string; email: string };

export class JWTService {
  private readonly accessTokenSecret: string;

  constructor(ots: JWTServiceOptions) {
    this.accessTokenSecret = ots.accessTokenSecret;
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

  /**
   * Verify the access token
   *
   * @param {string} token JSON Web Token string
   * @returns {VerifyResult<AccessTokenPayload>} Result of the verification
   * @template T
   */
  public verifyAccessToken(token: string): VerifyResult<AccessTokenPayload> {
    try {
      const data = verify(token, this.accessTokenSecret) as AccessTokenPayload;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: this.handleError(err) };
    }
  }

  public decodeAccessToken(token: string): AccessTokenPayload | null {
    return decode(token) as AccessTokenPayload | null;
  }

  public signRid(payload: RidPayload, key: string, options?: SignOptions): string {
    return sign(payload, key, options);
  }

  public verifyRid(token: string, key: string): VerifyResult<RidPayload> {
    try {
      const data = verify(token, key) as RidPayload;
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
