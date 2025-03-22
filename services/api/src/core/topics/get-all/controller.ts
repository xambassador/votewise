import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  topicRepository: AppContext["repositories"]["topic"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const result = await this.ctx.topicRepository.findAll();
    const topics = result.map((topic) => ({ id: topic.id, name: topic.name }));
    return res.status(StatusCodes.OK).json({ topics });
  }
}
