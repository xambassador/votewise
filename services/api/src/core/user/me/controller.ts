import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  bucketService: AppContext["bucketService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _user = await this.ctx.userRepository.findById(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;
    const avatarUrl = await this.ctx.bucketService.getUrlForType(user.avatar_url ?? "", "avatar");
    const backgroundUrl = await this.ctx.bucketService.getUrlForType(user.cover_image_url ?? "", "background");
    const result = {
      id: user.id,
      username: user.user_name,
      email: user.email,
      registered_at: user.created_at,
      avatar_url: avatarUrl,
      background_url: backgroundUrl,
      first_name: user.first_name,
      last_name: user.last_name,
      about: user.about
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetMeResponse = ExtractControllerResponse<Controller>;
