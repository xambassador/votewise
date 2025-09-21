import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function acceptGroupJoinRequestControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "plugins"]);
  const controller = new Controller({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification,
    transactionManager: ctx.repositories.transactionManager,
    aggregator: ctx.repositories.aggregator
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "accept-group-join-request" });
  ctx.logger.info(`[${yellow("AcceptGroupJoinRequestController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
