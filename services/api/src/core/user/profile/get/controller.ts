import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  bucketService: AppContext["services"]["bucket"];
};

const ZParam = z.object({ username: z.string() });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const validate = ZParam.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const { username } = validate.data!;

    const user = await this.ctx.userRepository.getProfile(username);
    this.ctx.assert.resourceNotFound(!user, `User with username "${username}" not found`);

    const result = {
      id: user!.id,
      first_name: user!.first_name,
      last_name: user!.last_name,
      user_name: user!.user_name,
      avatar_url: this.ctx.bucketService.generatePublicUrl(user!.avatar_url ?? "", "avatar"),
      cover_image_url: this.ctx.bucketService.generatePublicUrl(user!.cover_image_url ?? "", "background"),
      about: user!.about,
      gender: user!.gender,
      location: user!.location,
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
