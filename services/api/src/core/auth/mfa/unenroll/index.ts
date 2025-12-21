import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { VerifyFactorSevice } from "../verify/service";
import { Controller } from "./controller";

export function unEnrollMFAControllerFactory(path: string) {
  const ctx = AppContext.instance;
  const verifyFactorService = new VerifyFactorSevice(ctx);
  const controller = new Controller({ ...ctx, verifyFactorService });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIVE_PER_HOUR,
    keyPrefix: "rtUnEnrollMFA"
  });
  const exceptionLayer = new ExceptionLayer({ name: "unenroll-mfa" });
  ctx.logger.info(`[${yellow("UnEnrollMFAController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
