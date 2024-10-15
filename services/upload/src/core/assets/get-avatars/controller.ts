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
          res.json(results);
        });
      })
      .on("error", (err) => {
        res.status(500).json({ error: { message: err.message } });
      });
  }
}
