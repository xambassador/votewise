import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  feedRepository: AppContext["repositories"]["feed"];
  commentRepository: AppContext["repositories"]["comment"];
  bucketService: AppContext["bucketService"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const feedId = req.params.feedId as string;
    this.ctx.assert.badRequest(typeof feedId !== "string", "Invalid feed ID provided");
    const comments = await this.ctx.commentRepository.findByFeedId(feedId);
    comments.forEach((comment) => {
      comment.user.avatar_url = this.ctx.bucketService.generatePublicUrl(comment.user.avatar_url ?? "", "avatar");
      comment.replies.forEach((reply) => {
        reply.user.avatar_url = this.ctx.bucketService.generatePublicUrl(reply.user.avatar_url ?? "", "avatar");
      });
    });
    const result = { comments };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetCommentsResponse = ExtractControllerResponse<Controller>;
