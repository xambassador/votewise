import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getGroupRecommendationsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "bucketService", "mlService", "repositories", "logger"]);
  const controller = new Controller({
    mlService: ctx.mlService,
    assert: ctx.assert,
    bucketService: ctx.bucketService,
    groupRepository: ctx.repositories.group
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-group-recommendations" });
  ctx.logger.info(`[${yellow("GetGroupRecommendationsController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
