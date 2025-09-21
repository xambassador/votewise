import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function kickMemberControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "logger"]);
  const controller = new Controller({
    assert: ctx.assert,
    groupRepository: ctx.repositories.group,
    userRepository: ctx.repositories.user,
    aggregator: ctx.repositories.aggregator,
    transactionManager: ctx.repositories.transactionManager
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "kick-member" });
  ctx.logger.info(`[${yellow("KickMemberController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
