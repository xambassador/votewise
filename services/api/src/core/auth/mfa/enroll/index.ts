import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function enrollMFAControllerFactory() {
  const ctx = AppContext.getInjectionTokens([
    "cryptoService",
    "repositories",
    "environment",
    "config",
    "assert",
    "logger"
  ]);
  const controller = new Controller({
    cryptoService: ctx.cryptoService,
    userRepository: ctx.repositories.user,
    factorRepository: ctx.repositories.factor,
    environment: ctx.environment,
    config: ctx.config,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "enroll_MFA" });
  ctx.logger.info(`[${yellow("EnrollMFAController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
