import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { unpack } from "@/lib/cursor";
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
    const cursor = unpack(query.cursor, () => this.ctx.assert.unprocessableEntity(true, "Invalid cursor"));

    const total = await this.ctx.repositories.user.countUserFollowing(username!);
    const following = await this.ctx.repositories.user.getUserFollowing(username!, { page, limit, cursor });

    const nextCursor = following.length < limit ? undefined : following.at(-1);
    const pagination = new PaginationBuilder({
      limit,
      page,
      total,
      cursor: nextCursor ? { primary: nextCursor.follow_created_at, secondary: nextCursor.id } : undefined
    }).build();

    const result = { following, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserFollowingsResponse = ExtractControllerResponse<Controller>;
