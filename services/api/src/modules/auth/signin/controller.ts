import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";
import type { Strategy } from "./strategies";

import { StatusCodes } from "http-status-codes";

import { Minute } from "@votewise/lib/times";

type ControllerOptions = {
  filters: Filters;
  cryptoService: AppContext["cryptoService"];
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  cache: AppContext["cache"];
  strategies: Record<"email" | "username", Strategy>;
};

export class Controller {
  private readonly ctx: ControllerOptions;
  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.ctx.filters.parseRequest(req);
    const { password, username, email } = body;

    const { strategy, value, type } = this.getStrategy(email, username);
    const _user = await strategy.handle(value);
    this.ctx.assert.resourceNotFound(!_user, `User with ${type} ${value} not found`);

    const user = _user!;
    const isValid = await this.ctx.cryptoService.comparePassword(password, user.password);
    this.ctx.assert.invalidInput(!isValid, "Invalid password");

    const accessToken = this.ctx.jwtService.signAccessToken(
      {
        username: user.user_name,
        user_id: user.id,
        is_email_verified: user.is_email_verify,
        email: user.email
      },
      { expiresIn: "15m" }
    );
    const refreshToken = this.ctx.jwtService.signRefreshToken({ user_id: user.id }, { expiresIn: "7d" });

    // Setting expiry for 20 minutes, so client can refresh the token
    await this.ctx.cache.setWithExpiry(`session:${user.id}`, refreshToken, Minute * 20);

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
