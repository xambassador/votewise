import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

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

    let total: number;
    let posts: Awaited<ReturnType<Controller["getPosts"]>>["posts"];

    if (type === "posts") {
      const result = await this.getPosts(username!, page, limit);
      total = result.total;
      posts = result.posts;
    } else {
      const result = await this.getVotedPosts(username!, page, limit);
      total = result.total;
      posts = result.posts;
    }

    const pagination = new PaginationBuilder({ limit, page, total }).build();
    posts.forEach((post) => {
      post.author.avatar_url = this.ctx.services.bucket.generatePublicUrl(post.author.avatar_url ?? "", "avatar");
      post.voters.forEach((voter) => {
        voter.avatar_url = this.ctx.services.bucket.generatePublicUrl(voter.avatar_url ?? "", "avatar");
      });
    });

    const result = { posts, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }

  private async getPosts(username: string, page: number, limit: number) {
    const total = await this.ctx.repositories.user.countUserPosts(username);
    const posts = await this.ctx.repositories.user.getUserPosts(username, { page, limit });
    return { total, posts };
  }

  private async getVotedPosts(username: string, page: number, limit: number) {
    const total = await this.ctx.repositories.user.countUserVotedPosts(username!);
    const posts = await this.ctx.repositories.user.getUserVotedPosts(username!, { page, limit });
    return { total, posts };
  }
}

export type GetUserPostsResponse = ExtractControllerResponse<Controller>;
