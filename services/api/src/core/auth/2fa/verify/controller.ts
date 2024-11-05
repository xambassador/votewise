import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZVerify2FA } from "@votewise/schemas/auth";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  cryptoService: AppContext["cryptoService"];
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
  environment: AppContext["environment"];
  sessionManager: AppContext["sessionManager"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  /**
   * Verify 2FA code after user signs in
   */
  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZVerify2FA).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const { accessToken } = locals.session;
    const { code } = body;

    if (locals.session.user.is_2fa_enabled === "true" && locals.session.user.is_2fa_verified === "true") {
      return res.status(StatusCodes.OK).json({ message: "OK", verify: true });
    }

    const _user = await this.ctx.userRepository.findById(accessToken.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found");

    const user = _user!;
    this.ctx.assert.badRequest(!user.is_2fa_enabled, "2FA is not enabled. Please enable it first");

    const _encryptedSecret = user.totp_secret;
    this.ctx.assert.forbidden(!_encryptedSecret, "2FA secret not found. Please re-enable 2FA to get a new secret");
    const encryptedSecret = _encryptedSecret!;

    const secret = this.ctx.cryptoService.symmetricDecrypt(encryptedSecret, this.ctx.environment.APP_SECRET);
    const isValidCode = this.ctx.cryptoService.verify2FAToken(secret, code);
    this.ctx.assert.badRequest(!isValidCode, "Invalid 2FA code");

    await this.ctx.sessionManager.updateSessionData(accessToken.user_id, accessToken.session_id, {
      is_2fa_verified: "true"
    });

    return res.status(StatusCodes.OK).json({ message: "OK", verify: true });
  }
}
