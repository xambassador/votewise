import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function getFeedControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "bucketService"]);
  const controller = new Controller({
    assert: ctx.assert,
    feedRepository: ctx.repositories.feed,
    bucketService: ctx.bucketService
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtGetFeed"
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-feed" });
  ctx.logger.info(`[${yellow("GetFeedController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
