import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZForgotPassword } from "@votewise/schemas";
import { Minute } from "@votewise/times";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
  jwtService: AppContext["services"]["jwt"];
  cryptoService: AppContext["services"]["crypto"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
  requestParser: AppContext["plugins"]["requestParser"];
  sessionManager: AppContext["services"]["session"];
};

const msg = "If the email exists, a reset link will be sent.";

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZForgotPassword).parseRequest(req, res);
    const { email } = body;

    const _user = await this.ctx.userRepository.findByEmail(email);
    if (!_user) {
      return res.status(StatusCodes.OK).json({ message: msg });
    }

    const user = _user!;
    const { expiresIn, sessionId } = await this.ctx.sessionManager.createForgotPasswordSession({
      userId: user.id,
      email
    });
    this.ctx.tasksQueue.add({
      name: "email",
      payload: {
        templateName: "forgot-password",
        to: email,
        subject: "Forgot Password",
        locals: {
          firstName: user.first_name,
          expiresInUnit: "minutes",
          expiresIn: expiresIn / Minute,
          resetLink: this.ctx.appUrl + `/auth/reset-password?token=${sessionId}`,
          email,
          logo: this.ctx.appUrl + "/assets/logo.png"
        }
      }
    });

    const result = { message: msg };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type ForgotPasswordResponse = ExtractControllerResponse<Controller>;
