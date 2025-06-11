import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function getOnboardStatusControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "sessionManager"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager,
    assert: ctx.assert
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtGetOnboardStatus"
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-onboard-status" });
  ctx.logger.info(`[${yellow("GetOnboardStatusController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
