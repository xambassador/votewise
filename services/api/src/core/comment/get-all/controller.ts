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
    const avatarPromises = comments.map((comment) => {
      if (!comment.user.avatar_url) {
        return Promise.resolve(comment);
      }
      return new Promise<typeof comment>((resolve) => {
        this.ctx.bucketService
          .getUrlForType(comment.user.avatar_url ?? "", "avatar")
          .then((url) => {
            resolve({
              ...comment,
              user: {
                ...comment.user,
                avatar_url: url
              }
            });
          })
          .catch(() => {
            resolve(comment);
          });
      });
    });
    const commentsWithAvatars = await Promise.all(avatarPromises);
    const result = { comments: commentsWithAvatars };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetCommentsResponse = ExtractControllerResponse<Controller>;
