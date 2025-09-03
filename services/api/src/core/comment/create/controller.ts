import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ERROR_CODES } from "@votewise/constant";
import { ZCommentCreate } from "@votewise/schemas/comment";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  commentRepository: AppContext["repositories"]["comment"];
  feedRepository: AppContext["repositories"]["feed"];
  requestParser: AppContext["plugins"]["requestParser"];
  aggregator: AppContext["repositories"]["aggregator"];
  transactionManager: AppContext["repositories"]["transactionManager"];
};

const ZQuery = z.object({ feedId: z.string() });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const query = validate.data!;
    const feedId = query.feedId;

    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.requestParser.getParser(ZCommentCreate).parseRequest(req, res);
    const currentUserId = locals.payload.sub;

    const _feed = await this.ctx.feedRepository.findById(feedId);
    this.ctx.assert.resourceNotFound(!_feed, `Feed with ID ${feedId} not found`, ERROR_CODES.FEED.FEED_NOT_FOUND);

    if (body.parent_id) {
      const parent = await this.ctx.commentRepository.findById(body.parent_id);
      this.ctx.assert.resourceNotFound(!parent, `Parent comment with ID ${body.parent_id} not found`);
    }

    const comment = await this.ctx.transactionManager.withTransaction(async (tx) => {
      const comment = await this.ctx.commentRepository.create({
        text: body.text,
        parentId: body.parent_id,
        postId: feedId,
        userId: currentUserId
      });

      // We are only aggregating comments and not replies
      if (!body.parent_id) {
        await this.ctx.aggregator.postAggregator.aggregate(
          feedId,
          (stats) => ({
            ...stats,
            comments: (stats?.comments ?? 0) + 1
          }),
          tx
        );
        await this.ctx.aggregator.userAggregator.aggregate(
          currentUserId,
          (stats) => ({
            ...stats,
            total_comments: (stats?.total_comments ?? 0) + 1
          }),
          tx
        );
      }

      return comment;
    });

    const result = { id: comment.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateCommentResponse = ExtractControllerResponse<Controller>;
