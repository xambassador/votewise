import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZResetPassword, ZResetPasswordQuery } from "@votewise/schemas";

type ControllerOptions = {
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  requestParser: AppContext["plugins"]["requestParser"];
  sessionManager: AppContext["sessionManager"];
  taskQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
};

const { USER_NOT_FOUND, FORGOT_PASSWORD_SESSION_EXPIRED } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const parser = this.ctx.requestParser.getParser(ZResetPassword, ZResetPasswordQuery);
    const { body, query } = parser.parseRequest(req, res);
    const { password } = body;
    const { token } = query;

    const _session = await this.ctx.sessionManager.getForgotPasswordSession(token);
    this.ctx.assert.resourceNotFound(
      !_session,
      "Your session has expired. Please try again",
      FORGOT_PASSWORD_SESSION_EXPIRED
    );
    const session = _session!;

    const _user = await this.ctx.userRepository.findById(session.userId);
    this.ctx.assert.resourceNotFound(!_user, `User with email ${session.email} not found`, USER_NOT_FOUND);
    const user = _user!;

    const hashedPassword = await this.ctx.cryptoService.hashPassword(password);
    await this.ctx.userRepository.update(user.id, {
      password: hashedPassword,
      secret: this.ctx.cryptoService.generateUUID()
    });
    await this.ctx.sessionManager.deleteForgotPasswordSession(token);
    await this.ctx.sessionManager.clearUserSessions(user.id);

    this.ctx.taskQueue.add({
      name: "email",
      payload: {
        templateName: "password-reset-success",
        to: user.email,
        subject: "Password changed successfully",
        locals: {
          name: user.first_name,
          loginUrl: this.ctx.appUrl + "/auth/signin",
          logo: this.ctx.appUrl + "/assets/logo.png"
        }
      }
    });

    return res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
  }
}
