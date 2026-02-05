import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { unpack } from "@/lib/cursor";
import { PaginationBuilder } from "@/lib/pagination";

const QuerySchema = z.object({ type: z.enum(["posts", "voted"]).default("posts") });

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

    const validatedQuery = QuerySchema.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!validatedQuery.success, "Invalid query type");

    const { type } = validatedQuery.data!;
    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.feeds.limit : query.limit;
    const cursor = unpack(query.cursor, () => this.ctx.assert.unprocessableEntity(true, "Invalid cursor"));

    let total: number;
    let posts: Awaited<ReturnType<Controller["getPosts"]>>["posts"];

    if (type === "posts") {
      const result = await this.getPosts(username!, page, limit, cursor);
      total = result.total;
      posts = result.posts;
    } else {
      const result = await this.getVotedPosts(username!, page, limit, cursor);
      total = result.total;
      posts = result.posts;
    }

    const nextCursor = posts.length < limit ? undefined : posts.at(-1);
    const pagination = new PaginationBuilder({
      limit,
      page,
      total,
      cursor: nextCursor ? { primary: nextCursor.created_at, secondary: nextCursor.id } : undefined
    }).build();

    const result = { posts, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }

  private async getPosts(username: string, page: number, limit: number, cursor: ReturnType<typeof unpack>) {
    const total = await this.ctx.repositories.user.countUserPosts(username);
    const result = await this.ctx.repositories.user.getUserPosts(username, { page, limit, cursor });
    return { total, posts: result };
  }

  private async getVotedPosts(username: string, page: number, limit: number, cursor: ReturnType<typeof unpack>) {
    const total = await this.ctx.repositories.user.countUserVotedPosts(username!);
    const result = await this.ctx.repositories.user.getUserVotedPosts(username!, { page, limit, cursor });
    return { total, posts: result };
  }
}

export type GetUserPostsResponse = ExtractControllerResponse<Controller>;
