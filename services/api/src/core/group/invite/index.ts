import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function sendGroupInviteControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "services", "eventBus", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.services.bucket,
    eventBus: ctx.eventBus,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification,
    userRepository: ctx.repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "send-group-invite" });
  ctx.logger.info(`[${yellow("SendGroupInviteController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
