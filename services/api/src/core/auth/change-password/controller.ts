import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZChangePassword } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.plugins.requestParser.getParser(ZChangePassword).parseRequest(req, res);
    const { old_password, new_password } = body;
    const userId = locals.payload.sub;

    const _user = await this.ctx.repositories.user.findById(userId);
    if (!_user) {
      await this.ctx.services.crypto.hashPassword(new_password);
      this.ctx.assert.resourceNotFound(!_user, "User not found");
    }

    const user = _user!;
    const isOldPasswordIsValid = await this.ctx.services.crypto.comparePassword(old_password, user.password);
    this.ctx.assert.invalidInput(!isOldPasswordIsValid, "Invalid old password");

    const hashedNewPassword = await this.ctx.services.crypto.hashPassword(new_password);
    await this.ctx.repositories.user.update(user.id, { password: hashedNewPassword });

    this.ctx.queues.tasksQueue.add({
      name: "email",
      payload: {
        templateName: "password-changed",
        to: user.email,
        subject: "Your password has been changed",
        locals: {
          firstName: user.first_name,
          device: req.headers["user-agent"] || "Unknown device",
          location: "Unknown location",
          ipAddress: locals.meta.ip || "Unknown",
          changedAt: new Date().toLocaleString(),
          logo: this.ctx.config.appUrl + "/assets/logo.png",
          resetLink: ""
        }
      }
    });

    const result = { message: "Password changed successfully" };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type ChangePasswordResponse = ExtractControllerResponse<Controller>;
