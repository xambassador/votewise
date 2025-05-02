import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZVerifyEmail } from "@votewise/schemas";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cache: AppContext["cache"];
  requestParser: AppContext["plugins"]["requestParser"];
  cryptoService: AppContext["cryptoService"];
};

const { INVALID_VERIFICATION_CODE, USER_NOT_FOUND, INVALID_EMAIL, INVALID_OTP, VERIFICATION_CODE_EXPIRED } =
  ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZVerifyEmail).parseRequest(req, res);

    const key = `email:${body.email}:verification`;
    const _session = await this.ctx.cache.get(key);
    this.ctx.assert.invalidInput(!_session, "Verification session expired. Try again.", VERIFICATION_CODE_EXPIRED);

    const session = JSON.parse(_session!) as { userId: string; ip: string; email: string; verificationCode: string };
    this.ctx.assert.invalidInput(
      session.verificationCode !== body.verification_code,
      "Invalid verification code",
      INVALID_VERIFICATION_CODE
    );

    this.ctx.assert.invalidInput(session.email !== body.email, "Invalid email", INVALID_EMAIL);

    const _user = await this.ctx.userRepository.findByEmail(body.email);
    this.ctx.assert.resourceNotFound(!_user, `User with email ${body.email} not found`, USER_NOT_FOUND);
    const user = _user!;

    if (user.is_email_verify) {
      return res.status(StatusCodes.OK).json({ user_id: user.id, email: user.email, is_email_verify: true });
    }

    const secret = user.secret;
    const isValidOtp = this.ctx.cryptoService.verifyOtp(secret, body.otp);
    this.ctx.assert.invalidInput(!isValidOtp, "Invalid otp", INVALID_OTP);

    await this.ctx.cache.del(key);
    await this.ctx.userRepository.update(user.id, {
      is_email_verify: true,
      email_confirmed_at: new Date(),
      secret: this.ctx.cryptoService.generateUUID()
    });

    const result = { user_id: user.id, email: user.email, is_email_verify: true };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type VerifyEmailResponse = ExtractControllerResponse<Controller>;
