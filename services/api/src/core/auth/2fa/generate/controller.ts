import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  cryptoService: AppContext["cryptoService"];
  userRepository: AppContext["repositories"]["user"];
  environment: AppContext["environment"];
  assert: AppContext["assert"];
  appName: AppContext["config"]["appName"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  /**
   * Generate a new 2FA secret and QR code for the user.
   */
  public async handle(_req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { accessToken } = locals.session;

    const _user = await this.ctx.userRepository.findById(accessToken.user_id);
    this.ctx.assert.resourceNotFound(!_user, "User not found");

    const user = _user!;

    this.ctx.assert.badRequest(
      user.is_2fa_enabled,
      "2FA is already enabled. If you want to reset 2FA, please disable it first."
    );

    const plainSecret = this.ctx.cryptoService.generate2FASecret();
    const encryptedSecret = this.ctx.cryptoService.symmetricEncrypt(plainSecret, this.ctx.environment.APP_SECRET);

    await this.ctx.userRepository.update(accessToken.user_id, {
      totp_secret: encryptedSecret,
      is_2fa_enabled: false // Explicitly set to false, so we can verify and enable after the user scans the QR code
    });

    const qrCode = await this.ctx.cryptoService.generate2FAQRCode(plainSecret, user.email, this.ctx.appName || "");

    return res.status(StatusCodes.OK).json({ qr_code: qrCode });
  }
}
