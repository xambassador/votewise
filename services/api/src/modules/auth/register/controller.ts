import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";

import { StatusCodes } from "http-status-codes";

import { Minute } from "@votewise/lib/times";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  cache: AppContext["cache"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  assert: AppContext["assert"];
  filters: Filters;
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.filters.parseRequest(req, res);
    const ip = locals.meta.ip;

    const user = await this.ctx.userRepository.findByEmail(body.email);
    this.ctx.assert.invalidInput(!!user, `${body.email} already exists`);

    const username = await this.ctx.userRepository.findByUsername(body.username);
    this.ctx.assert.invalidInput(!!username, `Username ${body.username} already exists`);

    const hash = await this.ctx.cryptoService.hashPassword(body.password);
    const createdUser = await this.ctx.userRepository.create({
      email: body.email,
      password: hash,
      user_name: body.username,
      first_name: body.first_name,
      last_name: body.last_name
    });

    const otp = this.ctx.cryptoService.getOtp();
    const verificationCode = this.ctx.cryptoService.generateUUID();
    const expiresIn = 5 * Minute;
    const data = { userId: createdUser.id, otp, ip };
    await this.ctx.cache.setWithExpiry(verificationCode, JSON.stringify(data), expiresIn);

    this.ctx.tasksQueue.add({
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp: data.otp
        }
      }
    });

    return res.status(StatusCodes.CREATED).json({
      user_id: createdUser.id,
      verification_code: verificationCode,
      expires_in: expiresIn,
      expires_in_unit: "ms"
    });
  }
}
