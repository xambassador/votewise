import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";
import type { VerifyFactorSevice } from "./service";

import { StatusCodes } from "http-status-codes";

import { COOKIE_KEYS } from "@votewise/constant";
import { ZVerifyChallenge } from "@votewise/schemas";
import { Day } from "@votewise/times";

import { getCookieOptions } from "@/utils/cookie";
import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext & { verifyFactorService: VerifyFactorSevice };

  constructor(opts: AppContext & { verifyFactorService: VerifyFactorSevice }) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body } = this.ctx.plugins.requestParser.getParser(ZVerifyChallenge).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const params = req.params as { factor_id: string };
    const { payload } = locals;
    const { factor_id } = params;

    await this.ctx.verifyFactorService.verifyChallenge({
      challengeId: body.challenge_id,
      factorId: factor_id,
      ip: locals.meta.ip,
      code: body.code,
      userId: payload.sub
    });

    const session = this.ctx.services.session.create({
      aal: "aal2",
      amr: [{ method: "totp", timestamp: Date.now() }, ...payload.amr],
      subject: payload.sub,
      email: payload.email,
      role: payload.role,
      appMetaData: payload.app_metadata,
      sessionId: payload.session_id,
      user_aal_level: payload.user_aal_level,
      isOnboarded: payload.is_onboarded
    });
    await this.ctx.services.session.update(session.sessionId, { aal: "aal2", factorId: factor_id });

    res.cookie(
      COOKIE_KEYS.accessToken,
      session.accessToken,
      getCookieOptions({ expires: new Date(Date.now() + session.expiresInMs) })
    );
    res.cookie(
      COOKIE_KEYS.refreshToken,
      session.refreshToken,
      getCookieOptions({ expires: new Date(Date.now() + 30 * Day) })
    );

    const result = {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      token_type: "Bearer",
      expires_in: session.expiresInMs,
      expires_at: session.expiresAt
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type VerifyMFAResponse = ExtractControllerResponse<Controller>;
