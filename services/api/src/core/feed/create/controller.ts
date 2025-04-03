import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZFeedCreate } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  requestParser: AppContext["plugins"]["requestParser"];
  feedRepository: AppContext["repositories"]["feed"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.requestParser.getParser(ZFeedCreate).parseRequest(req, res);
    const feed = await this.ctx.feedRepository.create({
      authorId: locals.payload.sub,
      type: "PUBLIC",
      content: body.content,
      title: body.title,
      slug: body.title,
      status: "OPEN"
    });
    return res.status(StatusCodes.CREATED).json({ id: feed.id });
  }
}
