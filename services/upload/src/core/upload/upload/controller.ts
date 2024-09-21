import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import fs from "node:fs";
import busboy from "busboy";
import { StatusCodes } from "http-status-codes";

import { InvalidInputError } from "@votewise/errors";

type ControllerOptions = {
  ctx: AppContext;
};

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle(req: Request, res: Response) {
    const { fileToken, startingByte } = this.parseHeaders(req);
    const bb = busboy({ headers: req.headers });

    bb.on("error", () =>
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: { message: "Error parsing file" }
      })
    );

    let fileName: string;

    bb.on("file", async (_, file, info) => {
      const { filename } = info;
      fileName = filename;
      const path = this.ctx.getBlobPath(fileName, fileToken);
      const fileInfo = await this.ctx.getFileInfo(path);

      if (fileInfo.size !== startingByte) {
        // If client send 400 bytes and then pause or cancel, and then wants to resume, the client should
        // send the starting byte as the last byte received by the server. Which is 400 in this case.
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: { message: "Bad starting bytes for chunk" }
        });
      }

      const s = fs.createWriteStream(path, { flags: "a" });
      file.pipe(s).on("error", (err) => {
        this.ctx.logger.error(`Error writing file`);
        this.ctx.logger.error("Error: ", { err });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: { message: "Error writing file" }
        });
      });

      return void 0;
    });

    bb.on("finish", () => {
      const url = `${req.protocol}://${req.hostname}:${this.ctx.config.port}/${this.ctx.getFileName(fileName, fileToken)}`;
      res.status(StatusCodes.OK).json({ url });
    });

    req.pipe(bb);
  }

  private parseHeaders<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>) {
    const contentRange = req.headers["content-range"];
    if (!contentRange) {
      throw new InvalidInputError("Missing content-range header");
    }
    const xh = this.ctx.config.appHeaders.fileToken;
    const fileToken = req.headers[xh];
    if (!fileToken) {
      throw new InvalidInputError(`Missing ${xh} header`);
    }

    if (fileToken && typeof fileToken !== "string") {
      throw new InvalidInputError(`Invalid ${xh} header`);
    }

    const isValidContentRange = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
    if (!isValidContentRange) {
      throw new InvalidInputError("Invalid content-range format. Expected format: bytes=start-end/total");
    }

    const startingByte = Number(isValidContentRange[1]);
    const endingByte = Number(isValidContentRange[2]);
    const fileSize = Number(isValidContentRange[3]);

    if (startingByte >= fileSize || startingByte >= endingByte || endingByte <= startingByte || endingByte > fileSize) {
      throw new InvalidInputError("Invalid content-range");
    }

    return { startingByte, fileToken };
  }
}
