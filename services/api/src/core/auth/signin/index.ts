import { AppContext } from "@/context";
import { UserRegisterService } from "@/core/auth/register/service";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";
import { EmailStrategy, UsernameStrategy } from "./strategies";

export function singinControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens([
    "repositories",
    "assert",
    "plugins",
    "jwtService",
    "cryptoService",
    "sessionManager",
    "cache",
    "queues",
    "config"
  ]);
  const emailStrategy = new EmailStrategy({ userRepository: ctx.repositories.user });
  const usernameStrategy = new UsernameStrategy({ userRepository: ctx.repositories.user });
  const strategies = { email: emailStrategy, username: usernameStrategy };
  const service = new UserRegisterService({
    cache: ctx.cache,
    tasksQueue: ctx.queues.tasksQueue,
    cryptoService: ctx.cryptoService,
    appUrl: ctx.config.appUrl
  });
  const controller = new Controller({
    strategies,
    requestParser: ctx.plugins.requestParser,
    jwtService: ctx.jwtService,
    cryptoService: ctx.cryptoService,
    assert: ctx.assert,
    sessionManager: ctx.sessionManager,
    refreshTokenRepository: ctx.repositories.refreshToken,
    userRepository: ctx.repositories.user,
    sessionRepository: ctx.repositories.session,
    factorRepository: ctx.repositories.factor,
    userRegisterService: service
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_MINUTE,
    keyPrefix: "rtSignin"
  });
  const exceptionLayer = new ExceptionLayer({ name: "signin" });
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
