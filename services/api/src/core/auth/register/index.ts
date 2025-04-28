import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";
import { UserRegisterService } from "./service";

export function registerControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens([
    "repositories",
    "assert",
    "queues",
    "cache",
    "cryptoService",
    "plugins",
    "config",
    "logger"
  ]);
  const service = new UserRegisterService({
    cache: ctx.cache,
    cryptoService: ctx.cryptoService,
    tasksQueue: ctx.queues.tasksQueue,
    appUrl: ctx.config.appUrl
  });
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    assert: ctx.assert,
    cryptoService: ctx.cryptoService,
    requestParser: ctx.plugins.requestParser,
    userRegisterService: service
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIVE_PER_HOUR,
    keyPrefix: "rtRegister"
  });
  const exceptionLayer = new ExceptionLayer({ name: "register" });
  ctx.logger.info(`[${yellow("RegisterController")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
