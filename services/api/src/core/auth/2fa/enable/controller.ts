import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZVerify2FA } from "@votewise/schemas/auth";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  cryptoService: AppContext["cryptoService"];
  userRepository: AppContext["repositories"]["user"];
  environment: AppContext["environment"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
  sessionManager: AppContext["sessionManager"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  /**
   * Enable 2FA for the authenticated user after scanning the QR code
   */
  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZVerify2FA).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const { accessToken } = locals.session;

    const _user = await this.ctx.userRepository.findById(accessToken.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found");

    const user = _user!;

    this.ctx.assert.badRequest(
      user.is_2fa_enabled,
      "2FA is already enabled. If you want to reset 2FA, please disable it first."
    );
    this.ctx.assert.operationNotAllowed(
      !user.totp_secret,
      "2FA secret not found. Please re-enable 2FA by regenerating the QR code."
    );

    const encryptedSecret = user.totp_secret!;
    const secret = this.ctx.cryptoService.symmetricDecrypt(encryptedSecret, this.ctx.environment.APP_SECRET);

    const isValid = this.ctx.cryptoService.verify2FAToken(secret, body.code);
    this.ctx.assert.badRequest(!isValid, "Invalid 2FA code");

    await this.ctx.sessionManager.deleteAll(user.id);
    await this.ctx.userRepository.update(user.id, {
      is_2fa_enabled: true,
      secret: this.ctx.cryptoService.generateUUID() // Rotate the secret, so any valid tokens for previous secret are invalidated
    });

    return res.status(StatusCodes.OK).json({ message: "2FA enabled successfully" });
  }
}
