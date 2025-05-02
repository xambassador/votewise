import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";
import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  timelineRepository: AppContext["repositories"]["timeline"];
  assert: AppContext["assert"];
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
    const { page, limit } = query;
    const timeline = await this.ctx.timelineRepository.findByUserId(locals.payload.sub, { page, limit });
    const feeds = timeline.map((timeline) => ({
      id: timeline.post.id,
      title: timeline.post.title,
      slug: timeline.post.slug,
      content: timeline.post.content,
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
        avatar_url: timeline.post.author.avatar_url
      },
      assets: timeline.post.assets.map((asset) => ({ url: asset.url, type: asset.type }))
    }));
    const pagination = new PaginationBuilder({ total, page, limit }).build();
    const result = {
      feeds,
      ...pagination
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllFeedsResponse = ExtractControllerResponse<Controller>;
