import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getBgControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "get-backgrounds" });
  ctx.logger.info(`[${yellow("GetBackgroundsController")}] dependencies initialized`);
  return exceptionLayer.catch(controller.handle.bind(controller));
}
