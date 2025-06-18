import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AppContext } from "@/context";

type TConfig = {
  name: string;
};

export class ExceptionLayer {
  private readonly name: string;

  constructor(cfg: TConfig) {
    this.name = cfg.name.toUpperCase();
  }

  public catch(handler: (...args: Parameters<RequestHandler>) => Promise<unknown>): RequestHandler {
    const ctx = AppContext.getInjectionTokens(["logger", "config"]);
    const name = this.name;
    return function routeHandler(req: Request, res: Response, next: NextFunction) {
      const result = handler(req, res, next);
      return Promise.resolve(result).catch((error) => {
        if (ctx.config.devMode) {
          if (error instanceof Error) {
            ctx.logger.error(`[${name} Exception Layer]: ${error.message}`);
          } else {
            ctx.logger.error(`[${name} Exception Layer]: Unknown error`);
          }
        }
        next(error);
      });
    };
  }
}
