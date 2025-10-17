import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZRefresh } from "@votewise/schemas";

const { INVALID_ACCESS_TOKEN, INVALID_REFRESH_TOKEN, USER_NOT_FOUND } = ERROR_CODES.AUTH;

const invalidTokenMsg = "Invalid access token";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.plugins.requestParser.getParser(ZRefresh).parseRequest(req, res);
    const ip = locals.meta.ip;
    const userAgent = req.headers["user-agent"] || "";

    const _accessTokenPayload = this.ctx.services.jwt.decodeAccessToken(body.access_token);
    this.ctx.assert.unprocessableEntity(!_accessTokenPayload, invalidTokenMsg, INVALID_ACCESS_TOKEN);

    const accessTokenPayload = _accessTokenPayload!;
    this.ctx.assert.unprocessableEntity(!accessTokenPayload.session_id, invalidTokenMsg, INVALID_ACCESS_TOKEN);
    this.ctx.assert.unprocessableEntity(!accessTokenPayload.sub, invalidTokenMsg, INVALID_ACCESS_TOKEN);

    const _token = await this.ctx.repositories.refreshToken.find(body.refresh_token);
    const isInvalid = !_token || _token.revoked || _token.user_id !== accessTokenPayload.sub;
    this.ctx.assert.unprocessableEntity(isInvalid, "Invalid refresh token", INVALID_REFRESH_TOKEN);

    const token = _token!;
    const _user = await this.ctx.repositories.user.findById(token.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found", USER_NOT_FOUND);

    const user = _user!;

    await this.ctx.services.session.delete(accessTokenPayload.session_id);
    await this.ctx.repositories.refreshToken.revoke(token.id);

    const session = this.ctx.services.session.create({
      aal: accessTokenPayload.aal, // This need to be accessed from the token payload, because user may completed the MFA
      amr: accessTokenPayload.amr,
      email: user.email,
      role: accessTokenPayload.role,
      subject: user.id,
      appMetaData: accessTokenPayload.app_metadata,
      userMetaData: accessTokenPayload.user_metadata,
      user_aal_level: accessTokenPayload.user_aal_level
    });
    await this.ctx.services.session.save(session.sessionId, {
      ip,
      userAgent,
      aal: accessTokenPayload.aal,
      userId: user.id
    });
    await this.ctx.repositories.refreshToken.create({ token: session.refreshToken, userId: user.id });

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

export type RefreshSessionResponse = ExtractControllerResponse<Controller>;
