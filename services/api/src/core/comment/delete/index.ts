import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function deleteCommentControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "services", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    commentRepository: ctx.repositories.comment,
    feedRepository: ctx.repositories.feed,
    transactionManger: ctx.repositories.transactionManager,
    aggregator: ctx.repositories.aggregator
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-comments" });
  ctx.logger.info(`[${yellow("DeleteCommentController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
