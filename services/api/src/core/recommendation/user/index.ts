import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getRecommendateUserControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "logger", "mlService", "assert", "bucketService"]);
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    mlService: ctx.mlService,
    assert: ctx.assert,
    bucketService: ctx.bucketService
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-recommendate-user" });
  ctx.logger.info(`[${yellow("GetRecommendateUserController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
