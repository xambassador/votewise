import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function enrollMFAControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["services", "repositories", "environment", "config", "assert", "logger"]);
  const controller = new Controller({
    cryptoService: ctx.services.crypto,
    userRepository: ctx.repositories.user,
    factorRepository: ctx.repositories.factor,
    environment: ctx.environment,
    config: ctx.config,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_MINUTE,
    keyPrefix: "rtEnrollMFA"
  });
  const exceptionLayer = new ExceptionLayer({ name: "enroll_MFA" });
  ctx.logger.info(`[${yellow("EnrollMFAController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
