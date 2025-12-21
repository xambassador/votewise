import type { AppContext } from "@/context";

import { ERROR_CODES } from "@votewise/constant";

const { FACTOR_NOT_FOUND, CHALLENGE_NOT_FOUND, INVALID_CHALLENGE, CHALLENGE_EXPIRED } = ERROR_CODES["2FA"];
const CHALLENGE_NOT_FOUND_MSG = "MFA factor with the provided challenge ID not found";
const INVALID_CHALLENGE_MSG = "Challenge and verify IP address mismatch. Try enrollment again";
const CHALLENGE_EXPIRED_MSG = `MFA challenge has expired, verify against another challenge or create a new challenge.`;

export class VerifyFactorSevice {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async verifyChallenge(data: {
    code: string;
    factorId: string;
    challengeId: string;
    userId: string;
    ip: string;
  }) {
    const { factorId, challengeId, userId, ip, code } = data;
    const _factor = await this.ctx.repositories.factor.findById(factorId);
    this.ctx.assert.resourceNotFound(!_factor, "Factor not found", FACTOR_NOT_FOUND);
    this.ctx.assert.resourceNotFound(_factor?.user_id !== userId, "Factor not found", FACTOR_NOT_FOUND);

    const _challenge = await this.ctx.repositories.challenge.findById(challengeId);
    this.ctx.assert.resourceNotFound(!_challenge, CHALLENGE_NOT_FOUND_MSG, CHALLENGE_NOT_FOUND);

    const challenge = _challenge!;
    const factor = _factor!;

    const isValidChallenge = challenge.verified_at !== null || challenge.ip !== ip;
    this.ctx.assert.unprocessableEntity(isValidChallenge, INVALID_CHALLENGE_MSG, INVALID_CHALLENGE);

    const fiveMinutesAgoInSecs = 300;
    this.ctx.assert.unprocessableEntity(
      this.hasExpired(challenge.created_at, fiveMinutesAgoInSecs),
      CHALLENGE_EXPIRED_MSG,
      CHALLENGE_EXPIRED
    );

    const secret = this.ctx.services.crypto.symmetricDecrypt(factor.secret, this.ctx.environment.APP_SECRET);
    const valid = this.ctx.services.crypto.verify2FACode(secret, code);
    this.ctx.assert.unprocessableEntity(!valid, "Invalid TOTP code provided", ERROR_CODES["2FA"].INVALID_TOTP);
    await this.ctx.repositories.challenge.verifyChallenge(challenge.id);
    if (factor.status === "UNVERIFIED") {
      await this.ctx.repositories.factor.verifyFactor(factor.id);
    }
  }

  /**
   * Check if a challenge has expired
   *
   * @param date - The date the challenge was created
   * @param expiryDuration - The duration of the challenge in seconds
   */
  private hasExpired(date: Date, expiryDuration: number) {
    return new Date() > this.getExpiryTime(date, expiryDuration);
  }

  /**
   * Get the expiry time of a challenge
   *
   * @param date - The date the challenge was created
   * @param expiryDuration - The duration of the challenge in seconds
   */
  private getExpiryTime(date: Date, expiryDuration: number) {
    return new Date(date.getTime() + expiryDuration * 1000);
  }
}
