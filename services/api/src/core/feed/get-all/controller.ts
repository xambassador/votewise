import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  timelineRepository: AppContext["repositories"]["timeline"];
  assert: AppContext["assert"];
};

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10)
});

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const schema = querySchema.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const timeline = await this.ctx.timelineRepository.findByUserId(locals.payload.sub);
    const feeds = timeline.map((timeline) => timeline.post);
    return res.status(StatusCodes.OK).json({ feeds });
  }
}
