import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const topicsList = await this.ctx.repositories.topic.findAll();
    const topics = topicsList.map((topic) => ({ id: topic.id, name: topic.name }));
    const result = { topics };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllTopicsResponse = ExtractControllerResponse<Controller>;
