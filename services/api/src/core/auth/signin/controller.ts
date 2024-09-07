import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Strategy } from "./strategies";

import { StatusCodes } from "http-status-codes";

import { Minute } from "@votewise/lib/times";
import { ZSignin } from "@votewise/schemas";

type ControllerOptions = {
  requestParser: AppContext["plugins"]["requestParser"];
  cryptoService: AppContext["cryptoService"];
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  strategies: Record<"email" | "username", Strategy>;
  sessionManager: AppContext["sessionManager"];
};

export class Controller {
  private readonly ctx: ControllerOptions;
  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZSignin).parseRequest(req, res);
    const { password, username, email } = body;
    const ip = locals.meta.ip;

    const { strategy, value, type } = this.getStrategy(email, username);
    const _user = await strategy.handle(value);
    this.ctx.assert.resourceNotFound(!_user, `User with ${type} ${value} not found`);

    const user = _user!;
    const isValid = await this.ctx.cryptoService.comparePassword(password, user.password);
    this.ctx.assert.invalidInput(!isValid, "Invalid password");

    await this.ctx.sessionManager.enforceSessionLimit(user.id);
    const { accessToken, refreshToken } = await this.ctx.sessionManager.create({
      userId: user.id,
      ip,
      isEmailVerified: user.is_email_verify,
      userAgent: req.headers["user-agent"]
    });

    return res
      .status(StatusCodes.OK)
      .json({ access_token: accessToken, refresh_token: refreshToken, expires_in: 15 * Minute, expires_in_unit: "ms" });
  }

  private getStrategy(email: string | undefined, username: string | undefined) {
    if (email) return { strategy: this.ctx.strategies.email, value: email, type: "email" };
    if (username) return { strategy: this.ctx.strategies.username, value: username, type: "username" };
    throw new Error("Invalid strategy");
  }
}
