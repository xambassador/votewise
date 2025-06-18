import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZCommentCreate } from "@votewise/schemas/comment";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  commentRepository: AppContext["repositories"]["comment"];
  feedRepository: AppContext["repositories"]["feed"];
  requestParser: AppContext["plugins"]["requestParser"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.requestParser.getParser(ZCommentCreate).parseRequest(req, res);
    const currentUserId = locals.payload.sub;
    const feedId = req.params.feedId as string;
    this.ctx.assert.badRequest(typeof feedId !== "string", "Invalid feed ID provided");

    const _feed = await this.ctx.feedRepository.findById(feedId);
    this.ctx.assert.resourceNotFound(!_feed, `Feed with ID ${feedId} not found`, ERROR_CODES.FEED.FEED_NOT_FOUND);
    const feed = _feed!;

    // TODO: Check if the current user is allowed to comment on this feed.
    // this.ctx.permissions.assert.canCommentOnFeed(currentUserId, feed.id)
    // or
    // this.ctx.permissionManager.check(currentUserId, "canCommentOnFeed", feed.id);

    const comment = await this.ctx.commentRepository.create({
      text: body.text,
      parentId: body.parent_id,
      postId: feed.id,
      userId: currentUserId
    });

    const result = { id: comment.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateCommentResponse = ExtractControllerResponse<Controller>;
