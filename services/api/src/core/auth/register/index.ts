import { yellow } from "chalk";

import { AppContext } from "@/context";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";
import { UserRegisterService } from "./service";

export function registerControllerFactory(path: string) {
  const ctx = AppContext.instance;
  const service = new UserRegisterService(ctx);
  const controller = new Controller({ ...ctx, userRegisterService: service });
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIVE_PER_HOUR,
    keyPrefix: "rtRegister"
  });
  const exceptionLayer = new ExceptionLayer({ name: "register" });
  ctx.logger.info(`[${yellow("RegisterController")}] dependencies initialized`);
  return [limiter, exceptionLayer.catch(controller.handle.bind(controller))];
}
