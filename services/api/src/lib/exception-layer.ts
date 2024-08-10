import type { AppContext } from "@/http/context";
import type { NextFunction, Request, RequestHandler, Response } from "express";

type Dependencies = {
  ctx: AppContext;
  name: string;
};

export class ExceptionLayer {
  public name: string;
  private readonly ctx: AppContext;

  constructor(cfg: Dependencies) {
    this.name = cfg.name.toUpperCase();
    this.ctx = cfg.ctx;
  }

  cactchException(handler: (...args: Parameters<RequestHandler>) => Promise<unknown>): RequestHandler {
    const ctx = this.ctx;
    const name = this.name;
    return function routeHandler(req: Request, res: Response, next: NextFunction) {
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
