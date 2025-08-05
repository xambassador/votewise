import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getNotificationsControllerFactory() {
  const { assert, repositories, logger, services } = AppContext.getInjectionTokens([
    "assert",
    "repositories",
    "logger",
    "services"
  ]);
  const controller = new Controller({
    assert,
    notificationRepository: repositories.notification,
    bucketService: services.bucket,
    groupRepository: repositories.group,
    userRepository: repositories.user
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-notification" });
  logger.info(`[${yellow("GetNotificationsController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
