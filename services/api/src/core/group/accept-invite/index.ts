import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function acceptGroupInviteControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "plugins"]);
  const controller = new Controller({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification,
    transactionManager: ctx.repositories.transactionManager
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "accept-group-invite" });
  ctx.logger.info(`[${yellow("AcceptGroupInviteController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
