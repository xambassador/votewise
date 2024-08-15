import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { StatusFilters } from "./filter";

import { StatusCodes } from "http-status-codes";

import { ResourceNotFoundError } from "@votewise/lib/errors";

type ControllerOptions = {
  ctx: AppContext;
  filters: StatusFilters;
};

export class Controller {
  private readonly ctx: AppContext;
  private readonly filters: StatusFilters;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
    this.filters = opts.filters;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.filters.parseRequest(req);
    const { fileName, token } = body;
    const path = this.ctx.getBlobPath(fileName, token);
    const stats = await this.getFileInfo(path);
    return res.status(StatusCodes.OK).json({ total_chunk_uploaded: stats.size });
  }

  private async getFileInfo(path: string) {
    try {
      return await this.ctx.getFileInfo(path);
    } catch (err) {
      throw new ResourceNotFoundError("No file found with provided credentials");
    }
  }
}
