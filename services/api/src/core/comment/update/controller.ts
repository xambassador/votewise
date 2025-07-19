import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZCommentUpdate } from "@votewise/schemas/comment";

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
    const { body } = this.ctx.requestParser.getParser(ZCommentUpdate).parseRequest(req, res);
    const currentUserId = locals.payload.sub;
    const feedId = req.params.feedId as string;
    const commentId = req.params.commentId as string;

    this.ctx.assert.badRequest(typeof feedId !== "string", "Invalid feed ID provided");
    this.ctx.assert.badRequest(typeof commentId !== "string", "Invalid comment ID provided");

    const _comment = await this.ctx.commentRepository.findById(commentId);
    this.ctx.assert.resourceNotFound(!_comment, "Comment not found");
    const comment = _comment!;

    this.ctx.assert.resourceNotFound(comment.post_id !== feedId, "Comment not found");
    this.ctx.assert.forbidden(comment.user_id !== currentUserId, "You are not allowed to update this comment");

    await this.ctx.commentRepository.update({
      commentId,
      userId: currentUserId,
      text: body.text
    });

    const result = { id: comment.id };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type UpdateCommentResponse = ExtractControllerResponse<Controller>;
