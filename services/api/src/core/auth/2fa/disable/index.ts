import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function disable2FAControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "sessionManager", "cryptoService"]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager,
    cryptoService: ctx.cryptoService
  });
  const exceptionLayer = new ExceptionLayer({ name: "disable_2FA" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
