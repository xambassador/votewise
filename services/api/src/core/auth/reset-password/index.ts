import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function resetPasswordControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "plugins",
    "repositories",
    "jwtService",
    "assert",
    "cryptoService",
    "sessionManager"
  ]);
  const controller = new Controller({
    requestParser: ctx.plugins.requestParser,
    userRepository: ctx.repositories.user,
    jwtService: ctx.jwtService,
    assert: ctx.assert,
    cryptoService: ctx.cryptoService,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "reset-password" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
