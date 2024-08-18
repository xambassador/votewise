import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  filters: Filters;
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  jwtService: AppContext["jwtService"];
  cryptoService: AppContext["cryptoService"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.filters.parseRequest(req, res);
    const { email } = body;
    const { ip } = locals.meta;

    const _user = await this.ctx.userRepository.findByEmail(email);
    this.ctx.assert.resourceNotFound(!_user, `User with email ${email} not found`);

    const user = _user!;
    const verificationCode = this.ctx.cryptoService.hash(`${user.id}:${ip}`);
    const ridToken = this.ctx.jwtService.signRid({ email, verification_code: verificationCode }, { expiresIn: "5m" });
    this.ctx.tasksQueue.add({
      name: "email",
      payload: {
        templateName: "forgot-password",
        to: email,
        subject: "Forgot Password",
        locals: {
          token: ridToken,
          firstName: user.first_name,
          expiresInUnit: "minutes",
          expiresIn: 5,
          clientUrl: this.ctx.appUrl,
          ip
        }
      }
    });

    return res.status(StatusCodes.OK).json({ email, rid_token: ridToken });
  }
}
