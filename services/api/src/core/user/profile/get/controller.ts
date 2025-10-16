import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

const ZParam = z.object({ username: z.string() });

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const validate = ZParam.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const { username } = validate.data!;

    const user = await this.ctx.repositories.user.getProfile(username);
    this.ctx.assert.resourceNotFound(!user, `User with username "${username}" not found`);
    const following = await this.ctx.repositories.follow.isFollowing(currentUserId, user!.id);

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
      self_follow: !!following,
      aggregation: {
        total_comments: user!.userAggregates?.total_comments ?? 0,
        total_posts: user!.userAggregates?.total_posts ?? 0,
        total_votes: user!.userAggregates?.total_votes ?? 0,
        total_followers: user!.userAggregates?.total_followers ?? 0,
        total_following: user!.userAggregates?.total_following ?? 0,
        total_groups: user!.userAggregates?.total_groups ?? 0
      },
      joined_at: user!.created_at
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserProfileResponse = ExtractControllerResponse<Controller>;
