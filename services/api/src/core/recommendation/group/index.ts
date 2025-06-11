import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function getGroupRecommendationsControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "bucketService", "mlService", "repositories", "logger"]);
  const controller = new Controller({
    mlService: ctx.mlService,
    assert: ctx.assert,
    bucketService: ctx.bucketService,
    groupRepository: ctx.repositories.group
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtGetGroupRecommendations"
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-group-recommendations" });
  ctx.logger.info(`[${yellow("GetGroupRecommendationsController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
