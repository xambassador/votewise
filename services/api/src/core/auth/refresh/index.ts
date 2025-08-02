import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function refreshControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "services", "plugins", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    useRepository: ctx.repositories.user,
    sessionManager: ctx.services.session,
    requestParser: ctx.plugins.requestParser,
    jwtService: ctx.services.jwt,
    refreshTokensRepository: ctx.repositories.refreshToken
  });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.THREE_PER_MINUTE,
    keyPrefix: "rtRefresh"
  });
  const exceptionLayer = new ExceptionLayer({ name: "refresh" });
  ctx.logger.info(`[${yellow("RefreshController")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
