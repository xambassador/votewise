import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _user = await this.ctx.repositories.user.getMyAccount(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;
    const result = {
      id: user!.id,
      first_name: user!.first_name,
      last_name: user!.last_name,
      user_name: user!.user_name,
      avatar_url: this.ctx.services.bucket.generatePublicUrl(user!.avatar_url ?? "", "avatar"),
      cover_image_url: this.ctx.services.bucket.generatePublicUrl(user!.cover_image_url ?? "", "background"),
      about: user!.about,
      gender: user!.gender,
      location: user!.location,
      joined_at: user!.created_at,
      email: user!.email,
      facebook_url: user!.facebook_profile_url,
      twitter_url: user!.twitter_profile_url,
      instagram_url: user!.instagram_profile_url,
      factors: user.factors
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetMyAccountResponse = ExtractControllerResponse<Controller>;
