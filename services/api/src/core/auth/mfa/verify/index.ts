import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function verifyChallengeControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "plugins", "environment", "logger", "services"]);
  const controller = new Controller({
    assert: ctx.assert,
    challengeRepository: ctx.repositories.challenge,
    requestParser: ctx.plugins.requestParser,
    factorRepository: ctx.repositories.factor,
    environment: ctx.environment,
    cryptoService: ctx.services.crypto,
    sessionManager: ctx.services.session
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_MINUTE,
    keyPrefix: "rtVerifyMFA"
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-challenge" });
  ctx.logger.info(`[${yellow("VerifyChallengeController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
