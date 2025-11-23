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
    const validation = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!validation.success, "Invalid query");
    const query = validation.data!;
    const limit = query.limit < 1 ? PAGINATION.trending.limit : query.limit;
    const cursor = unpack(query.cursor, () => this.ctx.assert.unprocessableEntity(true, "Invalid cursor"));
    const hotUsers = await this.ctx.repositories.hotViews.getHotUsers({ cursor, limit });
    const users = hotUsers.map((user) => ({
      id: user.id,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: this.ctx.services.bucket.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      about: user.about,
      created_at: user.created_at,
      updated_at: user.updated_at,
      interests: user.interests,
      aggregates: user.aggregates
    }));
    const nextCursor = users.length < limit ? undefined : hotUsers.at(-1);
    const pagination = new PaginationBuilder({
      total: 0,
      page: query.page,
      limit,
      cursor: nextCursor
        ? { primary: nextCursor.created_at, secondary: `${nextCursor.score}_${nextCursor.user_name}` }
        : undefined
    }).build();
    const result = { users, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetHotUsersResponse = ExtractControllerResponse<Controller>;
