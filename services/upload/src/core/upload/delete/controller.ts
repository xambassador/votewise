import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import fs from "node:fs/promises";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ResourceNotFoundError } from "@votewise/lib/errors";

type ControllerOptions = {
  ctx: AppContext;
};

const ZQuery = z.object({
  file_name: z.string({ required_error: "file_name is missing" }).min(1, { message: "file_name is missing" })
});
const ZBody = z.object({}).optional();

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle(req: Request, res: Response) {
    const token = req.params.token as string;
    const { query } = this.ctx.plugins.requestParser.getParser(ZBody, ZQuery).parseRequest(req);
    const { file_name: fileName } = query;
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
