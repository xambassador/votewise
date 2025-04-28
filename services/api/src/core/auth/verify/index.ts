import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function verifyControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "assert", "cache", "plugins", "cryptoService", "logger"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    cache: ctx.cache,
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    cryptoService: ctx.cryptoService
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-email" });
  ctx.logger.info(`[${yellow("VerifyController")}] dependencies initialized`);
  return [exceptionLayer.catch(controller.handle.bind(controller))];
}
