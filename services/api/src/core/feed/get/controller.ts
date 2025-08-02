import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  feedRepository: AppContext["repositories"]["feed"];
  assert: AppContext["assert"];
  bucketService: AppContext["services"]["bucket"];
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
    this.ctx.assert.resourceNotFound(!_feed, `Feed with id ${id} not found`, ERROR_CODES.FEED.FEED_NOT_FOUND);
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
      comment_count: feed._count.comments,
      voters: feed.upvotes.map((v) => ({
        id: v.user.id,
        avatar_url: v.user.avatar_url
      }))
    };
    const authorAvatarPromise = new Promise<typeof result>((resolve) => {
      this.ctx.bucketService
        .getUrlForType(result.author.avatar_url ?? "", "avatar")
        .then((url) => {
          result.author.avatar_url = url;
          resolve(result);
        })
        .catch(() => {
          result.author.avatar_url = "";
          resolve(result);
        });
    });
    const votersAvatarPromises = result.voters
      .filter((v) => v.avatar_url)
      .map(
        (upvote) =>
          new Promise<typeof result>((resolve) => {
            this.ctx.bucketService
              .getUrlForType(upvote.avatar_url || "", "avatar")
              .then((url) => {
                upvote.avatar_url = url;
                resolve(result);
              })
              .catch(() => resolve(result));
          })
      );
    await Promise.all([authorAvatarPromise, ...votersAvatarPromises]);
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetFeedResponse = ExtractControllerResponse<Controller>;
