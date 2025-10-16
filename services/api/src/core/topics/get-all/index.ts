import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllTopicsControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller(ctx);
  const exceptionLayer = new ExceptionLayer({ name: "get-all-topics" });
  ctx.logger.info(`[${yellow("GetAllTopicsController")}] dependencies initialized`);
  return [exceptionLayer.catch(controller.handle.bind(controller))];
}
