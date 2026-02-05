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
    const hotFeeds = await this.ctx.repositories.hotViews.getHotFeeds({ cursor, limit });
    const feeds = hotFeeds.map((feed) => ({
      id: feed.id,
      title: feed.title,
      slug: feed.slug,
      created_at: feed.created_at,
      updated_at: feed.updated_at,
      hash_tags: [],
      author: {
        id: feed.author.id,
        user_name: feed.author.user_name,
        first_name: feed.author.first_name,
        last_name: feed.author.last_name,
        avatar_url: feed.author.avatar_url
      },
      votes: feed.postAggregates?.votes ?? 0,
      voters: feed.upvotes.map((vote) => ({
        id: vote.user.id,
        avatar_url: vote.user.avatar_url
      })),
      comments: feed.postAggregates?.comments ?? 0
    }));
    const nextCursor = hotFeeds.length < limit ? undefined : hotFeeds.at(-1);
    const pagination = new PaginationBuilder({
      total: 0,
      page: query.page,
      limit,
      cursor: nextCursor
        ? { primary: nextCursor.created_at, secondary: `${nextCursor.score}_${nextCursor.id}` }
        : undefined
    }).build();
    const result = { feeds, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetHotFeedsResponse = ExtractControllerResponse<Controller>;
