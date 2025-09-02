import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function rejectGroupJoinRequestControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "plugins"]);
  const controller = new Controller({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "reject-group-join-request" });
  ctx.logger.info(`[${yellow("RejectGroupJoinRequestController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
