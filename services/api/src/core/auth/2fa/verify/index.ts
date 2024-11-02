import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function verify2FAControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "cryptoService",
    "repositories",
    "assert",
    "plugins",
    "environment",
    "sessionManager"
  ]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    cryptoService: ctx.cryptoService,
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    environment: ctx.environment,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify_2FA" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
