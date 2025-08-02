import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function getRecommendateUserControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["repositories", "logger", "services", "assert"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    mlService: ctx.services.ml,
    assert: ctx.assert,
    bucketService: ctx.services.bucket
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtGetRecommendateUser"
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-recommendate-user" });
  ctx.logger.info(`[${yellow("GetRecommendateUserController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
