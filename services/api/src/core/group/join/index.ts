import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { PrivateGroupStrategy, PublicGroupStrategy } from "./strategies";

export function joinGroupControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger", "services", "eventBus"]);
  const publicGroupStrategy = new PublicGroupStrategy({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification,
    bucketService: ctx.services.bucket,
    eventBus: ctx.eventBus,
    userRepository: ctx.repositories.user
  });
  const privateGroupStrategy = new PrivateGroupStrategy({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    notificationRepository: ctx.repositories.notification,
    bucketService: ctx.services.bucket,
    eventBus: ctx.eventBus,
    userRepository: ctx.repositories.user
  });
  const controller = new Controller({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    strategies: {
      private: privateGroupStrategy,
      public: publicGroupStrategy
    }
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "join-group" });
  ctx.logger.info(`[${yellow("JoinGroupController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
