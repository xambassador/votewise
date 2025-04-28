import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function verifyChallangeControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "plugins",
    "environment",
    "cryptoService",
    "sessionManager",
    "logger"
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
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "verify-challenge" });
  ctx.logger.info(`[${yellow("VerifyChallangeController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
