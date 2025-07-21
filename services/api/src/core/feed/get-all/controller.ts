import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";
import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  timelineRepository: AppContext["repositories"]["timeline"];
  assert: AppContext["assert"];
  bucketService: AppContext["bucketService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const total = await this.ctx.timelineRepository.countByUserId(locals.payload.sub);
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.feeds.limit : query.limit;
    const timeline = await this.ctx.timelineRepository.findByUserId(locals.payload.sub, { page, limit });
    const timelineFeedPromises = timeline.map((timeline) => ({
      id: timeline.post.id,
      title: timeline.post.title,
      slug: timeline.post.slug,
      created_at: timeline.post.created_at,
      updated_at: timeline.post.updated_at,
      hash_tags: timeline.post.hashTags.map((tag) => ({
        name: tag.hash_tag.name
      })),
      author: {
        id: timeline.post.author.id,
        user_name: timeline.post.author.user_name,
        first_name: timeline.post.author.first_name,
        last_name: timeline.post.author.last_name,
        avatar_url: this.ctx.bucketService.generatePublicUrl(timeline.post.author.avatar_url ?? "", "avatar")
      },
      votes: timeline.post._count.upvotes,
      voters: timeline.post.upvotes.map((vote) => ({
        id: vote.user.id,
        avatar_url: this.ctx.bucketService.generatePublicUrl(vote.user.avatar_url ?? "", "avatar")
      })),
      comments: timeline.post._count.comments
    }));
    const feeds = await Promise.all(timelineFeedPromises);
    const pagination = new PaginationBuilder({ total, page, limit }).build();
    const result = {
      feeds,
      ...pagination
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllFeedsResponse = ExtractControllerResponse<Controller>;
