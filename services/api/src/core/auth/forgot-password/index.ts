import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function forgotPasswordControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "services",
    "queues",
    "config",
    "plugins",
    "logger"
  ]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    cryptoService: ctx.services.crypto,
    jwtService: ctx.services.jwt,
    tasksQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl,
    requestParser: ctx.plugins.requestParser,
    sessionManager: ctx.services.session
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_HOUR,
    keyPrefix: "rtForgotPassword",
    blockDuration: 60 * 60 * 3
  });
  const exceptionLayer = new ExceptionLayer({ name: "forgot-password" });
  ctx.logger.info(`[${yellow("ForgotPassword")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
