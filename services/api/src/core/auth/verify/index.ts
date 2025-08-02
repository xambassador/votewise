import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function verifyControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["repositories", "assert", "cache", "plugins", "services", "logger"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    cache: ctx.cache,
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    cryptoService: ctx.services.crypto
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_HOUR,
    keyPrefix: "rtVerifyEmail"
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-email" });
  ctx.logger.info(`[${yellow("VerifyController")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
