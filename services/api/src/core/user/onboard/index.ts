import { yellow } from "chalk";

import { AppContext } from "@/context";
import { twoFactorAuthMiddlewareFactory } from "@/http/middlewares/2fa";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function onboardControllerFactory(path: string) {
  const ctx = AppContext.instance;
  const controller = new Controller(ctx);
  const auth = authMiddlewareFactory();
  const mfa = twoFactorAuthMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIFTEEN_PER_MINUTE,
    keyPrefix: "rtOnboard"
  });
  const exceptionLayer = new ExceptionLayer({ name: "onboard" });
  ctx.logger.info(`[${yellow("OnboardController")}] dependencies initialized`);
  return [limiter, auth, mfa, exceptionLayer.catch(controller.handle.bind(controller))];
}
