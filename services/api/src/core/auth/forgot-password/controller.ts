import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZForgotPassword } from "@votewise/schemas";
import { Minute } from "@votewise/times";

const msg = "If the email exists, a reset link will be sent.";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.plugins.requestParser.getParser(ZForgotPassword).parseRequest(req, res);
    const { email } = body;

    const _user = await this.ctx.repositories.user.findByEmail(email);
    if (!_user) {
      return res.status(StatusCodes.OK).json({ message: msg });
    }

    const user = _user!;
    const { expiresIn, sessionId } = await this.ctx.services.session.createForgotPasswordSession({
      userId: user.id,
      email
    });
    this.ctx.queues.tasksQueue.add({
      name: "email",
      payload: {
        templateName: "forgot-password",
        to: email,
        subject: "Forgot Password",
        locals: {
          firstName: user.first_name,
          expiresInUnit: "minutes",
          expiresIn: expiresIn / Minute,
          resetLink: this.ctx.config.appUrl + `/auth/reset-password?token=${sessionId}`,
          email,
          logo: this.ctx.config.appUrl + "/assets/logo.png"
        }
      }
    });

    const result = { message: msg };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type ForgotPasswordResponse = ExtractControllerResponse<Controller>;
