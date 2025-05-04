import type { AppContext } from "@/context";
import type { RequestHandler } from "express";

type ExceptionLayerOptions = {
  ctx: AppContext;
  name: string;
};

export class ExceptionLayer {
  private readonly name: string;
  private readonly ctx: AppContext;

  constructor(opts: ExceptionLayerOptions) {
    this.name = opts.name.toUpperCase();
    this.ctx = opts.ctx;
  }

  public catch(handler: (...arg: Parameters<RequestHandler>) => Promise<unknown>): RequestHandler {
    const ctx = this.ctx;
    const name = this.name;
    return function routeHandler(req, res, next) {
      const result = handler(req, res, next);
      return Promise.resolve(result).catch((error) => {
        if (ctx.config.devMode) {
          if (error instanceof Error) {
            ctx.logger.error(`[${name} Exception Layer]: ${error.message}`);
          } else {
            ctx.logger.error(`[${name} Exception Layer]: Unknow error`);
          }
        }
        next(error);
      });
    };
  }
}
