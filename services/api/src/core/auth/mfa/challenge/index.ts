import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function challengeMFAControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["repositories", "assert", "logger"]);
  const controller = new Controller({
    factorRepository: ctx.repositories.factor,
    challengeRepository: ctx.repositories.challenge,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_MINUTE,
    keyPrefix: "rtChallengeMFA"
  });
  const exceptionLayer = new ExceptionLayer({ name: "challengeMFA" });
  ctx.logger.info(`[${yellow("ChallengeMFAController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
