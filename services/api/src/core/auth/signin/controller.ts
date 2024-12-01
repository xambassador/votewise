import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Strategy } from "./strategies";

import { StatusCodes } from "http-status-codes";

import { ZSignin } from "@votewise/schemas";

type ControllerOptions = {
  requestParser: AppContext["plugins"]["requestParser"];
  cryptoService: AppContext["cryptoService"];
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  strategies: Record<"email" | "username", Strategy>;
  sessionManager: AppContext["sessionManager"];
  refreshTokenRepository: AppContext["repositories"]["refreshToken"];
  userRepository: AppContext["repositories"]["user"];
  sessionRepository: AppContext["repositories"]["session"];
  factorRepository: AppContext["repositories"]["factor"];
};

export class Controller {
  private readonly ctx: ControllerOptions;
  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZSignin).parseRequest(req, res);
    const { password, username, email } = body;
    const userAgent = req.headers["user-agent"] || "";
    const ip = locals.meta.ip;

    const { strategy, value, type } = this.getStrategy(email, username);
    const _user = await strategy.handle(value);
    this.ctx.assert.resourceNotFound(!_user, `User with ${type} ${value} not found`);

    const user = _user!;
    const isValid = await this.ctx.cryptoService.comparePassword(password, user.password);
    this.ctx.assert.invalidInput(!isValid, "Invalid password");
    this.ctx.assert.invalidInput(
      !user.is_email_verify,
      `Email ${user.email} is not verified. Please verify your email`
    );

    const factors = await this.ctx.factorRepository.findByUserId(user.id);
    const verifiedFactors = factors
      .filter((f) => f.status === "VERIFIED")
      .map((f) => ({ id: f.id, type: f.factor_type, status: f.status, name: f.friendly_name }));
    const aal = verifiedFactors.length > 0 ? "aal2" : "aal1";

    const session = this.ctx.sessionManager.create({
      subject: user.id,
      aal: "aal1", // This will always be aal1, because user has not completed the MFA yet or if they dont have any MFA
      amr: [{ method: "password", timestamp: Date.now() }],
      email: user.email,
      role: "user",
      appMetaData: { provider: "email", providers: ["email"] }
    });

    await this.ctx.sessionManager.save(session.sessionId, { ip, userAgent, aal, userId: user.id });
    await this.ctx.refreshTokenRepository.create({ token: session.refreshToken, userId: user.id });

    const lastLogin = new Date();
    await this.ctx.userRepository.update(user.id, { last_login: lastLogin });

    return res.status(StatusCodes.OK).json({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      token_type: "Bearer",
      expires_in: session.expiresInSec,
      expires_at: session.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        role: "user",
        email_confirmed_at: user.email_confirmed_at,
        email_confirmation_sent_at: user.email_confirmation_sent_at,
        last_sign_in_at: lastLogin,
        factors: verifiedFactors
      }
    });
  }

  private getStrategy(email: string | undefined, username: string | undefined) {
    if (email) return { strategy: this.ctx.strategies.email, value: email, type: "email" };
    if (username) return { strategy: this.ctx.strategies.username, value: username, type: "username" };
    throw new Error("Invalid strategy");
  }
}
