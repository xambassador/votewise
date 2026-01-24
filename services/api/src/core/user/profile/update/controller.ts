import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZUpdateProfile } from "@votewise/schemas/user";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const { body } = this.ctx.plugins.requestParser.getParser(ZUpdateProfile).parseRequest(req, res);

    this.ctx.assert.forbidden(currentUserId !== body.id, "You can only update your own profile");

    const user = await this.ctx.repositories.user.getMyProfile(body.id);
    this.ctx.assert.resourceNotFound(!user, "User not found");

    await this.ctx.repositories.user.update(body.id, {
      first_name: body.first_name,
      last_name: body.last_name,
      avatar_url: body.avatar,
      cover_image_url: body.cover,
      about: body.about
    });

    const result = { ...body };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type UpdateUserProfileResponse = ExtractControllerResponse<Controller>;
