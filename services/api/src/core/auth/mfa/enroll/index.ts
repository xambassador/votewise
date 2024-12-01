import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function enrollMFAControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["cryptoService", "repositories", "environment", "config", "assert"]);
  const controller = new Controller({
    cryptoService: ctx.cryptoService,
    userRepository: ctx.repositories.user,
    factorRepository: ctx.repositories.factor,
    environment: ctx.environment,
    config: ctx.config,
    assert: ctx.assert
  });
  const exceptionLayer = new ExceptionLayer({ name: "enroll_MFA" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
