import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { DeleteFilters } from "./filter";

import fs from "node:fs/promises";
import { StatusCodes } from "http-status-codes";

import { ResourceNotFoundError } from "@votewise/lib/errors";

type ControllerOptions = {
  ctx: AppContext;
  filters: DeleteFilters;
};

export class Controller {
  private readonly ctx: AppContext;
  private readonly filters: DeleteFilters;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
    this.filters = opts.filters;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.filters.parseRequest(req);
    const { fileName, token } = body;
    const path = this.ctx.getBlobPath(fileName, token);
    await this.deleteFile(path);
    return res.status(StatusCodes.OK).json({ message: "File deleted successfully" });
  }

  private async deleteFile(path: string) {
    try {
      await this.ctx.getFileInfo(path);
      await fs.unlink(path);
    } catch (err) {
      throw new ResourceNotFoundError("File not found");
    }
  }
}
