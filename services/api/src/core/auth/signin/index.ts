import { AppContext } from "@/context";
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
    "sessionManager"
  ]);
  const emailStrategy = new EmailStrategy({ userRepository: ctx.repositories.user });
  const usernameStrategy = new UsernameStrategy({ userRepository: ctx.repositories.user });
  const strategies = { email: emailStrategy, username: usernameStrategy };
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
    factorRepository: ctx.repositories.factor
  });
  const exceptionLayer = new ExceptionLayer({ name: "signin" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
