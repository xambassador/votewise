import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZRefresh } from "@votewise/schemas";
import { Minute } from "@votewise/times";

type ControllerOptions = {
  sessionManager: AppContext["sessionManager"];
  useRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
  jwtPlugin: AppContext["plugins"]["jwt"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZRefresh).parseRequest(req, res);
    const { refresh_token } = this.ctx.jwtPlugin.parse({
      accessToken: body.access_token,
      refreshToken: body.refresh_token
    });
    const ip = locals.meta.ip;

    const sessionKey = this.ctx.sessionManager.getSessionKey(refresh_token.user_id, refresh_token.session_id);
    const sessionIp = await this.ctx.sessionManager.getFieldFromSession(sessionKey, "ip");
    this.ctx.assert.badRequest(!sessionIp, "Invalid credentials");
    this.ctx.assert.badRequest(sessionIp !== ip, "Invalid request");

    const _user = await this.ctx.useRepository.findById(refresh_token.user_id);
    this.ctx.assert.resourceNotFound(!_user, `User with id ${refresh_token.user_id} not found`);
    const user = _user!;

    await this.ctx.sessionManager.delete(refresh_token.user_id, refresh_token.session_id);
    const { accessToken, refreshToken } = await this.ctx.sessionManager.create({
      userId: user.id,
      isEmailVerified: user.is_email_verify,
      ip,
      userAgent: req.headers["user-agent"]
    });

    return res
      .status(StatusCodes.OK)
      .json({ access_token: accessToken, refresh_token: refreshToken, expires_in: 15 * Minute, expires_in_unit: "ms" });
  }
}
