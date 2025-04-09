import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZForgotPassword } from "@votewise/schemas";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  jwtService: AppContext["jwtService"];
  cryptoService: AppContext["cryptoService"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
  requestParser: AppContext["plugins"]["requestParser"];
};

const msg = "If the email exists, a reset link will be sent.";

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZForgotPassword).parseRequest(req, res);
    const { email } = body;
    const { ip } = locals.meta;

    const _user = await this.ctx.userRepository.findByEmail(email);
    if (!_user) {
      return res.status(StatusCodes.OK).json({ message: msg });
    }

    const user = _user!;
    const verificationCode = this.ctx.cryptoService.hash(`${user.id}:${ip}`);
    const data = { email, verification_code: verificationCode };
    const key = user.secret;
    const ridToken = this.ctx.jwtService.signRid(data, key, { expiresIn: "5m" });
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
          resetLink: this.ctx.appUrl + `/auth/reset-password?token=${ridToken}`,
          ip,
          email,
          logo: this.ctx.appUrl + "/assets/logo.png"
        }
      }
    });

    return res.status(StatusCodes.OK).json({ message: msg });
  }
}
