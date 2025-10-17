import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZResetPassword, ZResetPasswordQuery } from "@votewise/schemas";

const { USER_NOT_FOUND, FORGOT_PASSWORD_SESSION_EXPIRED } = ERROR_CODES.AUTH;
const sessionExpiredMessage = "Your session has expired. Please try again";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const parser = this.ctx.plugins.requestParser.getParser(ZResetPassword, ZResetPasswordQuery);
    const { body, query } = parser.parseRequest(req, res);
    const { password } = body;
    const { token } = query;

    const _session = await this.ctx.services.session.getForgotPasswordSession(token);
    this.ctx.assert.resourceNotFound(!_session, sessionExpiredMessage, FORGOT_PASSWORD_SESSION_EXPIRED);
    const session = _session!;

    const _user = await this.ctx.repositories.user.findById(session.userId);
    this.ctx.assert.resourceNotFound(!_user, `User with email ${session.email} not found`, USER_NOT_FOUND);
    const user = _user!;

    const hashedPassword = await this.ctx.services.crypto.hashPassword(password);
    await this.ctx.repositories.user.update(user.id, {
      password: hashedPassword,
      secret: this.ctx.services.crypto.generateUUID()
    });
    await this.ctx.services.session.deleteForgotPasswordSession(token);
    await this.ctx.services.session.clearUserSessions(user.id);

    this.ctx.queues.tasksQueue.add({
      name: "email",
      payload: {
        templateName: "password-reset-success",
        to: user.email,
        subject: "Password changed successfully",
        locals: {
          name: user.first_name,
          loginUrl: this.ctx.config.appUrl + "/auth/signin",
          logo: this.ctx.config.appUrl + "/assets/logo.png"
        }
      }
    });

    const result = { message: "Password updated successfully" };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type ResetPasswordResponse = ExtractControllerResponse<Controller>;
