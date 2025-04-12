import { AppContext } from "@/context";
import { UserRegisterService } from "@/core/auth/register/service";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { EmailStrategy, UsernameStrategy } from "./strategies";

export function singinControllerFactory() {
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
  const exceptionLayer = new ExceptionLayer({ name: "signin" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
