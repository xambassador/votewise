import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function verifyChallangeControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "plugins",
    "environment",
    "cryptoService",
    "sessionManager"
  ]);
  const controller = new Controller({
    assert: ctx.assert,
    challengeRepository: ctx.repositories.challenge,
    requestParser: ctx.plugins.requestParser,
    factorRepository: ctx.repositories.factor,
    environment: ctx.environment,
    cryptoService: ctx.cryptoService,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-challenge" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
