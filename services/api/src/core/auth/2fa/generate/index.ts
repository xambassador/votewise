import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function generate2FAControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "cryptoService", "environment", "config"]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user,
    environment: ctx.environment,
    cryptoService: ctx.cryptoService,
    appName: ctx.config.appName
  });
  const exceptionLayer = new ExceptionLayer({ name: "generate_2FA" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
