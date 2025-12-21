import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

const { USER_NOT_FOUND } = ERROR_CODES.AUTH;
const { CONFLICTING_FACTOR } = ERROR_CODES["2FA"];
const USER_NOT_FOUND_MSG = "A valid session and a registered user are required to enroll a factor";
const CONFLICTING_FACTOR_MSG = "You are already enrolled in this factor. Please remove it before enrolling again";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { payload } = locals;

    const _user = await this.ctx.repositories.user.findById(payload.sub);
    this.ctx.assert.resourceNotFound(!_user, USER_NOT_FOUND_MSG, USER_NOT_FOUND);
    const user = _user!;

    const userHasTOTPFactor = await this.ctx.repositories.factor.findByUserIdAndType(user.id, "TOTP");
    this.ctx.assert.unprocessableEntity(!!userHasTOTPFactor, CONFLICTING_FACTOR_MSG, CONFLICTING_FACTOR);

    const hasAnyUnverifiedTOTPFactor = await this.ctx.repositories.factor.findFirstUnverifiedByUserIdAndType(
      user.id,
      "TOTP"
    );
    const issuer = this.ctx.config.appName || "Votewise";

    if (hasAnyUnverifiedTOTPFactor) {
      const decryptedSecret = this.ctx.services.crypto.symmetricDecrypt(
        hasAnyUnverifiedTOTPFactor.secret,
        this.ctx.environment.APP_SECRET
      );
      const keyUri = this.ctx.services.crypto.generateKeyUri(decryptedSecret, user.email, issuer);
      const qrCode = await this.ctx.services.crypto.generate2FAQRCode(decryptedSecret, user.email, issuer);
      const result = {
        id: hasAnyUnverifiedTOTPFactor.id,
        type: hasAnyUnverifiedTOTPFactor.factor_type,
        totp: { qr_code: qrCode, uri: keyUri, secret: decryptedSecret }
      };
      return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
    }

    const totpSecret = this.ctx.services.crypto.generate2FASecret();
    const encryptedSecret = this.ctx.services.crypto.symmetricEncrypt(totpSecret, this.ctx.environment.APP_SECRET);
    const keyUri = this.ctx.services.crypto.generateKeyUri(totpSecret, user.email, issuer);
    const qrCode = await this.ctx.services.crypto.generate2FAQRCode(totpSecret, user.email, issuer);
    const factor = await this.ctx.repositories.factor.create({
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
