import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function challengeMFAControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "assert", "logger"]);
  const controller = new Controller({
    factorRepository: ctx.repositories.factor,
    challengeRepository: ctx.repositories.challenge,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "challengeMFA" });
  ctx.logger.info(`[${yellow("ChallengeMFAController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
