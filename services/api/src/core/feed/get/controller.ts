import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  feedRepository: AppContext["repositories"]["feed"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const id = req.params.id as string;
    this.ctx.assert.badRequest(typeof id !== "string", "Invalid id provided");
    const _feed = await this.ctx.feedRepository.findById(id);
    this.ctx.assert.resourceNotFound(!_feed, `Feed with id ${id} not found`);
    const feed = _feed!;
    const result = {
      id: feed.id,
      title: feed.title,
      slug: feed.slug,
      status: feed.status,
      type: feed.type,
      content: feed.content,
      created_at: feed.created_at,
      updated_at: feed.updated_at,
      author: feed.author,
      assets: feed.assets,
      ...(feed.author.id === locals.payload.sub ? { is_self: true } : {}),
      upvote_count: feed._count.upvotes,
      comment_count: feed._count.comments
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetFeedResponse = ExtractControllerResponse<Controller>;
