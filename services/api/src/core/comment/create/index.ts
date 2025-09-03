import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { rateLimitMiddlewareFactory } from "@/http/middlewares/rate-limit";
import { ExceptionLayer } from "@/lib/exception-layer";
import { rateLimitStrategies } from "@/lib/rate-limiter";

import { Controller } from "./controller";

export function createCommentControllerFactory(path: string) {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "plugins", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    commentRepository: ctx.repositories.comment,
    feedRepository: ctx.repositories.feed,
    requestParser: ctx.plugins.requestParser,
    transactionManager: ctx.repositories.transactionManager,
    aggregator: ctx.repositories.aggregator
  });
  const auth = authMiddlewareFactory();
  const limiter = rateLimitMiddlewareFactory(path, {
    ...rateLimitStrategies.FIVE_PER_MINUTE,
    keyPrefix: "rtCreateComment"
  });
  const exceptionLayer = new ExceptionLayer({ name: "create-comment" });
  ctx.logger.info(`[${yellow("CreateCommentController")}] dependencies initialized`);
  return [limiter, auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
