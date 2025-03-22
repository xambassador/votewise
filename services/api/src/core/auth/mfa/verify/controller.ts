import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZVerifyChallenge } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  challengeRepository: AppContext["repositories"]["challenge"];
  factorRepository: AppContext["repositories"]["factor"];
  requestParser: AppContext["plugins"]["requestParser"];
  assert: AppContext["assert"];
  cryptoService: AppContext["cryptoService"];
  environment: AppContext["environment"];
  sessionManager: AppContext["sessionManager"];
};

const { FACTOR_NOT_FOUND, CHALLENGE_NOT_FOUND, INVALID_CHALLENGE, CHALLENGE_EXPIRED } = ERROR_CODES["2FA"];
const CHALLENGE_NOT_FOUND_MSG = "MFA factor with the provided challenge ID not found";
const INVALID_CHALLENGE_MSG = "Challenge and verify IP address mismatch. Try enrollment again";
const CHALLENGE_EXPIRED_MSG = (id: string) =>
  `MFA challenge ${id} has expired, verify against another challenge or create a new challenge.`;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZVerifyChallenge).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const params = req.params as { factor_id: string };
    const { payload } = locals;
    const { factor_id } = params;

    const _factor = await this.ctx.factorRepository.findById(factor_id);
    this.ctx.assert.resourceNotFound(!_factor, "Factor not found", FACTOR_NOT_FOUND);
    this.ctx.assert.resourceNotFound(_factor?.user_id !== payload.sub, "Factor not found", FACTOR_NOT_FOUND);

    const _challenge = await this.ctx.challengeRepository.findById(body.challenge_id);
    this.ctx.assert.resourceNotFound(!_challenge, CHALLENGE_NOT_FOUND_MSG, CHALLENGE_NOT_FOUND);

    const challenge = _challenge!;
    const factor = _factor!;

    const isValidChallenge = challenge.verified_at !== null || challenge.ip !== locals.meta.ip;
    this.ctx.assert.unprocessableEntity(isValidChallenge, INVALID_CHALLENGE_MSG, INVALID_CHALLENGE);

    const fiveMinutesAgoInSecs = 300;
    this.ctx.assert.unprocessableEntity(
      this.hasExpired(challenge.created_at, fiveMinutesAgoInSecs),
      CHALLENGE_EXPIRED_MSG(challenge.id),
      CHALLENGE_EXPIRED
    );

    const secret = this.ctx.cryptoService.symmetricDecrypt(factor.secret, this.ctx.environment.APP_SECRET);
    const valid = this.ctx.cryptoService.verify2FACode(secret, body.code);
    this.ctx.assert.unprocessableEntity(!valid, "Invalid TOTP code provided", ERROR_CODES["2FA"].INVALID_TOTP);
    await this.ctx.challengeRepository.verifyChallenge(challenge.id);
    if (factor.status === "UNVERIFIED") {
      await this.ctx.factorRepository.verifyFactor(factor.id);
    }

    const session = this.ctx.sessionManager.create({
      aal: "aal2",
      amr: [{ method: "totp", timestamp: Date.now() }, ...payload.amr],
      subject: payload.sub,
      email: payload.email,
      role: payload.role,
      appMetaData: payload.app_metadata,
      sessionId: payload.session_id,
      user_aal_level: payload.user_aal_level
    });
    await this.ctx.sessionManager.update(session.sessionId, { aal: "aal2", factorId: factor.id });

    return res.status(StatusCodes.OK).json({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      token_type: "Bearer",
      expires_in: session.expiresInMs,
      expires_at: session.expiresAt
    });
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
