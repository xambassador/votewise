import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { Day } from "@votewise/times";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _user = await this.ctx.repositories.user.getMyProfile(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;
    let voteBucket = user.vote_bucket;
    const lastBucketResetAt = user.last_bucket_reset_at;
    const now = new Date();
    if (voteBucket <= 0) {
      const is24HrPassed = lastBucketResetAt ? now.getTime() - lastBucketResetAt.getTime() >= Day : true;
      if (is24HrPassed) {
        await this.ctx.repositories.user.update(user.id, { vote_bucket: 10, last_bucket_reset_at: now });
        voteBucket = 10;
      }
    }

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
      votes_left: voteBucket,
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

export type GetMeResponse = ExtractControllerResponse<Controller>;
