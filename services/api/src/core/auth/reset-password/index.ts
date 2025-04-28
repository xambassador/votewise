import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function resetPasswordControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens([
    "plugins",
    "repositories",
    "jwtService",
    "assert",
    "cryptoService",
    "sessionManager",
    "queues",
    "config",
    "logger"
  ]);
  const controller = new Controller({
    requestParser: ctx.plugins.requestParser,
    userRepository: ctx.repositories.user,
    jwtService: ctx.jwtService,
    assert: ctx.assert,
    cryptoService: ctx.cryptoService,
    sessionManager: ctx.sessionManager,
    taskQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_HOUR,
    keyPrefix: "rtResetPassword",
    blockDuration: 60 * 60 * 3
  });
  const exceptionLayer = new ExceptionLayer({ name: "reset-password" });
  ctx.logger.info(`[${yellow("ResetPassword")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
