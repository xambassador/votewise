import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  sessionManager: AppContext["sessionManager"];
  cryptoService: AppContext["cryptoService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(_req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { accessToken } = locals.session;

    const _user = await this.ctx.userRepository.findById(accessToken.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;

    const is2FAEnabled = user.is_2fa_enabled;
    this.ctx.assert.badRequest(!is2FAEnabled, "2FA is not enabled");

    await this.ctx.userRepository.update(accessToken.user_id, {
      totp_secret: null,
      is_2fa_enabled: false,
      secret: this.ctx.cryptoService.generateUUID() // Rotate the secret so that the old one is invalidated
    });
    await this.ctx.sessionManager.deleteAll(accessToken.user_id);

    return res.status(StatusCodes.OK).json({ message: "2FA disabled successfully" });
  }
}
