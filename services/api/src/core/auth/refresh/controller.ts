import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZRefresh } from "@votewise/schemas";

type ControllerOptions = {
  sessionManager: AppContext["sessionManager"];
  useRepository: AppContext["repositories"]["user"];
  refreshTokensRepository: AppContext["repositories"]["refreshToken"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
  jwtService: AppContext["jwtService"];
};

const { INVALID_ACCESS_TOKEN, INVALID_REFRESH_TOKEN, USER_NOT_FOUND } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZRefresh).parseRequest(req, res);
    const ip = locals.meta.ip;
    const userAgent = req.headers["user-agent"] || "";

    const _accessTokenPayload = this.ctx.jwtService.decodeAccessToken(body.access_token);
    this.ctx.assert.unprocessableEntity(!_accessTokenPayload, "Invalid access token", INVALID_ACCESS_TOKEN);

    const accessTokenPayload = _accessTokenPayload!;
    this.ctx.assert.unprocessableEntity(!accessTokenPayload.session_id, "Invalid access token", INVALID_ACCESS_TOKEN);
    this.ctx.assert.unprocessableEntity(!accessTokenPayload.sub, "Invalid access token", INVALID_ACCESS_TOKEN);

    const _token = await this.ctx.refreshTokensRepository.find(body.refresh_token);
    const isInvalid = !_token || _token.revoked || _token.user_id !== accessTokenPayload.sub;
    this.ctx.assert.unprocessableEntity(isInvalid, "Invalid refresh token", INVALID_REFRESH_TOKEN);

    const token = _token!;
    const _user = await this.ctx.useRepository.findById(token.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found", USER_NOT_FOUND);

    const user = _user!;

    await this.ctx.sessionManager.delete(accessTokenPayload.session_id);
    await this.ctx.refreshTokensRepository.revoke(token.id);

    const session = this.ctx.sessionManager.create({
      aal: accessTokenPayload.aal, // This need to be accessed from the token payload, because user may completed the MFA
      amr: accessTokenPayload.amr,
      email: user.email,
      role: accessTokenPayload.role,
      subject: user.id,
      appMetaData: accessTokenPayload.app_metadata,
      userMetaData: accessTokenPayload.user_metadata,
      user_aal_level: accessTokenPayload.user_aal_level
    });
    await this.ctx.sessionManager.save(session.sessionId, {
      ip,
      userAgent,
      aal: accessTokenPayload.aal,
      userId: user.id
    });
    await this.ctx.refreshTokensRepository.create({ token: session.refreshToken, userId: user.id });

    return res.status(StatusCodes.OK).json({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      token_type: "Bearer",
      expires_in: session.expiresInMs,
      expires_at: session.expiresAt
    });
  }
}
