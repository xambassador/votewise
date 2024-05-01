import type { SignOptions } from "jsonwebtoken";

import { sign, TokenExpiredError, verify } from "jsonwebtoken";

import { APP_SETTINGS } from "@/configs/index";

import env from "@/infra/env";

type Payload = {
  user_id: string;
  email: string;
};
type Codes = "TOKEN_EXPIRED" | "MALFORMED_TOKEN";
type VerifyResult = { success: true; data: Payload } | { success: false; error: Codes };

export class JWT {
  /**
   * Create a new JWT token
   *
   * @param {Payload} payload - The payload to be signed
   * @param {SignOptions} configs - The configurations for the token
   * @returns {string} - The JWT token
   */
  public getAccessToken(payload: Payload, configs?: SignOptions): string {
    const options = { ...configs, expiresIn: APP_SETTINGS.JWT.ACCESS_TOKEN_EXPIRATION };
    return sign(payload, env.ACCESS_TOKEN_SECRET, options);
  }

  /**
   * Create a new JWT token for refresh token
   *
   * @param {Payload} payload - The payload to be signed
   * @param {SignOptions} configs - The configurations for the token
   * @returns {string} - The JWT token
   */
  public getRefreshToken(payload: Payload, configs?: SignOptions): string {
    const options = { ...configs, expiresIn: APP_SETTINGS.JWT.REFRESH_TOKEN_EXPIRATION };
    return sign(payload, env.ACCESS_TOKEN_SECRET, options);
  }

  /**
   * Verify the JWT token
   *
   * @param {string} token - The JWT token to be verified
   * @returns {VerifyResult} - The result of the verification
   */
  public verifyAccessToken(token: string): VerifyResult {
    try {
      const data = verify(token, env.ACCESS_TOKEN_SECRET) as Payload;
      return { success: true, data };
    } catch (err) {
      return this.handleError(err);
    }
  }

  /**
   * Verify the refresh token
   *
   * @param {string} token - The refresh token to be verified
   * @returns {VerifyResult} - The result of the verification
   */
  public verifyRefreshToken(token: string): VerifyResult {
    try {
      const data = verify(token, env.REFRESH_TOKEN_SECRET) as Payload;
      return { success: true, data };
    } catch (err) {
      return this.handleError(err);
    }
  }

  /**
   * Handle the error from the verification
   *
   * @private
   * @param {unknown} err - The error to be handled
   * @returns {VerifyResult} - The result of the verification
   */
  private handleError(err: unknown): VerifyResult {
    if (err instanceof TokenExpiredError) {
      return { success: false, error: "TOKEN_EXPIRED" };
    }
    return { success: false, error: "MALFORMED_TOKEN" };
  }
}
