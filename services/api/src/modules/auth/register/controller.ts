import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";

import { StatusCodes } from "http-status-codes";

import { Minute } from "@votewise/lib/times";

import { parseIp } from "@/lib/ip";

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

  async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.ctx.filters.parseRequest(req);
    const user = await this.ctx.userRepository.findByEmail(body.email);
    this.ctx.assert.invalidInput(!!user, "Email already exists");
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

    // We are behind a proxy. So, we can trust this header
    const ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    this.ctx.assert.invalidInput(!ipAddress, "Looks like you are behind a proxy or VPN");

    const ip = parseIp(ipAddress!);
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
