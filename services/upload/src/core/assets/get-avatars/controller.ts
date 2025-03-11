import type { AppContext } from "@/context";
import type { Request, Response } from "express";

type ControllerOptions = {
  ctx: AppContext;
};

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle(_: Request, res: Response) {
    const bucket = "avatars";
    const results: { url: string; name?: string; etag?: string }[] = [];
    const promises: Promise<string>[] = [];
    this.ctx.minio
      .listObjectsV2(bucket)
      .on("data", (item) => {
        const promise = this.ctx.minio.presignedGetObject(bucket, item.name || `avatar_${item.etag}`);
        promise.then((url) => results.push({ url, name: item.name, etag: item.etag }));
        promises.push(promise);
      })
      .on("end", () => {
        Promise.all(promises).then(() => {
          const urls = results.map((r) => ({
            // TODO: Protocol should be configurable
            url:
              "http://" +
              this.ctx.environment.MINIO_ENDPOINT +
              ":" +
              this.ctx.environment.MINIO_PORT +
              "/" +
              bucket +
              "/" +
              r.name,
            name: r.name,
            etag: r.etag
          }));
          res.json(urls);
        });
      })
      .on("error", (err) => {
        this.ctx.logger.error("Error listing objects", { err });
        if ("code" in err && UPSTREAM_DOWN_ERROR_CODES.includes(err.code as string)) {
          res.status(503).json({ error: { message: "Service Unavailable" } });
          return;
        }
        res.status(500).json({ error: { message: err.message } });
      });
  }
}

const UPSTREAM_DOWN_ERROR_CODES = ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EPIPE", "ENOTFOUND", "EAI_AGAIN"];
