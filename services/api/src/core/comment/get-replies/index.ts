import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getRepliesControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "bucketService", "repositories", "logger", "bucketService"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.bucketService,
    commentRepository: ctx.repositories.comment,
    feedRepository: ctx.repositories.feed
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-replies" });
  ctx.logger.info(`[${yellow("GetRepliesController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
