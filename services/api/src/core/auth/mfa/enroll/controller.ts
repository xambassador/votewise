import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  cryptoService: AppContext["cryptoService"];
  userRepository: AppContext["repositories"]["user"];
  factorRepository: AppContext["repositories"]["factor"];
  environment: AppContext["environment"];
  assert: AppContext["assert"];
  config: AppContext["config"];
};

const { USER_NOT_FOUND } = ERROR_CODES.AUTH;
const { CONFLICTING_FACTOR } = ERROR_CODES["2FA"];
const USER_NOT_FOUND_MSG = "A valid session and a registered user are required to enroll a factor";
const CONFLICTING_FACTOR_MSG = "User already has a TOTP factor";

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { payload } = locals;

    const _user = await this.ctx.userRepository.findById(payload.sub);
    this.ctx.assert.resourceNotFound(!_user, USER_NOT_FOUND_MSG, USER_NOT_FOUND);

    const user = _user!;

    const userHasTOTPFactor = await this.ctx.factorRepository.findByUserIdAndType(user.id, "TOTP");
    this.ctx.assert.unprocessableEntity(userHasTOTPFactor !== null, CONFLICTING_FACTOR_MSG, CONFLICTING_FACTOR);

    const totpSecret = this.ctx.cryptoService.generate2FASecret();
    const encryptedSecret = this.ctx.cryptoService.symmetricEncrypt(totpSecret, this.ctx.environment.APP_SECRET);
    const issuer = this.ctx.config.appName || "Votewise";
    const keyUri = this.ctx.cryptoService.generateKeyUri(totpSecret, user.email, issuer);
    const qrCode = await this.ctx.cryptoService.generate2FAQRCode(totpSecret, user.email, issuer);
    const factor = await this.ctx.factorRepository.create({
      userId: user.id,
      status: "UNVERIFIED",
      secret: encryptedSecret,
      friendlyName: user.first_name,
      factorType: "TOTP"
    });
    const result = {
      id: factor.id,
      type: factor.factor_type,
      totp: { qr_code: qrCode, uri: keyUri, secret: totpSecret }
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type EnrollMFAResponse = ExtractControllerResponse<Controller>;
