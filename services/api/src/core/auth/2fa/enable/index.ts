import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function enable2FAControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "cryptoService",
    "environment",
    "repositories",
    "assert",
    "sessionManager",
    "plugins"
  ]);
  const controller = new Controller({
    cryptoService: ctx.cryptoService,
    environment: ctx.environment,
    userRepository: ctx.repositories.user,
    assert: ctx.assert,
    sessionManager: ctx.sessionManager,
    requestParser: ctx.plugins.requestParser
  });
  const exceptionLayer = new ExceptionLayer({ name: "enable_2FA" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
