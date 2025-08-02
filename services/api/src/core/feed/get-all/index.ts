import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function getAllFeedControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "services"]);
  const controller = new Controller({
    assert: ctx.assert,
    timelineRepository: ctx.repositories.timeline,
    bucketService: ctx.services.bucket
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtGetAllFeed"
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-all-feed" });
  ctx.logger.info(`[${yellow("GetAllFeedController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
