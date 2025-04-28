import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllTopicsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "logger"]);
  const controller = new Controller({
    topicRepository: ctx.repositories.topic
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-all-topics" });
  ctx.logger.info(`[${yellow("GetAllTopicsController")}] dependencies initialized`);
  return [exceptionLayer.catch(controller.handle.bind(controller))];
}
