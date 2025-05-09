import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllFeedControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "bucketService"]);
  const controller = new Controller({
    assert: ctx.assert,
    timelineRepository: ctx.repositories.timeline,
    bucketService: ctx.bucketService
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-all-feed" });
  ctx.logger.info(`[${yellow("GetAllFeedController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
