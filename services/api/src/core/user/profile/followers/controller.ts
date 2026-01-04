import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { username } = req.params;
    this.ctx.assert.unprocessableEntity(!username, "Username is required");

    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");

    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.trending.limit : query.limit;

    const total = await this.ctx.repositories.user.countUserFollowers(username!);
    const followers = await this.ctx.repositories.user.getUserFollowers(username!, { page, limit });
    const pagination = new PaginationBuilder({ limit, page, total }).build();
    followers.forEach((follower) => {
      follower.avatar_url = this.ctx.services.bucket.generatePublicUrl(follower.avatar_url ?? "", "avatar");
    });

    const result = { followers, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserFollowersResponse = ExtractControllerResponse<Controller>;
