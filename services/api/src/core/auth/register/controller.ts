import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZRegister } from "@votewise/schemas";
import { Minute } from "@votewise/times";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  cache: AppContext["cache"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
};

const { EMAIL_ALREADY_EXISTS } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZRegister).parseRequest(req, res);
    const ip = locals.meta.ip;

    const user = await this.ctx.userRepository.findByEmail(body.email);
    this.ctx.assert.invalidInput(!!user, `${body.email} already exists`, EMAIL_ALREADY_EXISTS);

    const hash = await this.ctx.cryptoService.hashPassword(body.password);
    const defaultUserName = this.ctx.cryptoService.generateNanoId(20);
    const createdUser = await this.ctx.userRepository.create({
      email: body.email,
      password: hash,
      user_name: `user_${defaultUserName}`, // We will update this later in onboarding process
      first_name: "INVALID_FIRST_NAME",
      last_name: "INVALID_LAST_NAME"
    });

    const otp = this.ctx.cryptoService.getOtp(createdUser.secret);
    const verificationCode = this.ctx.cryptoService.generateUUID().replace(/-/g, "");
    const expiresIn = 5 * Minute;
    const data = { userId: createdUser.id, ip, email: body.email };
    await this.ctx.cache.setWithExpiry(verificationCode, JSON.stringify(data), expiresIn);

    this.ctx.tasksQueue.add({
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp
        }
      }
    });

    return res.status(StatusCodes.CREATED).json({
      user_id: createdUser.id,
      verification_code: verificationCode,
      expires_in: expiresIn
    });
  }
}
