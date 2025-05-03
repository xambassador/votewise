import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
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
    const topicsList = await this.ctx.topicRepository.findAll();
    const topics = topicsList.map((topic) => ({ id: topic.id, name: topic.name }));
    const result = { topics };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllTopicsResponse = ExtractControllerResponse<Controller>;
