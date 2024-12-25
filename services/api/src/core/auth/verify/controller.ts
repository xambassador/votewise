import type { AppContext } from "@/context";
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

const {
  INVALID_VERIFICATION_CODE,
  INVALID_USER_ID,
  USER_NOT_FOUND,
  INVALID_EMAIL,
  EMAIL_ALREADY_VERIFIED,
  INVALID_OTP
} = ERROR_CODES.AUTH;
const { INVALID_REQUEST } = ERROR_CODES.COMMON;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZVerifyEmail).parseRequest(req, res);
    const ip = locals.meta.ip;

    const _session = await this.ctx.cache.get(body.verification_code);
    this.ctx.assert.invalidInput(!_session, "Invalid verification_code", INVALID_VERIFICATION_CODE);

    const session = JSON.parse(_session!) as { userId: string; ip: string };

    this.ctx.assert.invalidInput(!(session.ip === ip), "Invalid request", INVALID_REQUEST);
    this.ctx.assert.invalidInput(!(session.userId === body.user_id), "Invalid user_id", INVALID_USER_ID);

    const _user = await this.ctx.userRepository.findById(body.user_id);
    this.ctx.assert.resourceNotFound(!_user, `User with id ${body.user_id} not found`, USER_NOT_FOUND);

    const user = _user!;
    this.ctx.assert.invalidInput(user.email !== body.email, "Invalid email", INVALID_EMAIL);
    this.ctx.assert.invalidInput(user.is_email_verify, "Email is already verified", EMAIL_ALREADY_VERIFIED);

    const secret = user.secret;
    const isValidOtp = this.ctx.cryptoService.verifyOtp(secret, body.otp);
    this.ctx.assert.invalidInput(!isValidOtp, "Invalid otp", INVALID_OTP);

    await this.ctx.cache.del(body.verification_code);
    await this.ctx.userRepository.update(body.user_id, {
      is_email_verify: true,
      email_confirmed_at: new Date(),
      secret: this.ctx.cryptoService.generateUUID()
    });

    return res.status(StatusCodes.OK).json({ user_id: user.id, email: user.email, is_email_verify: true });
  }
}
