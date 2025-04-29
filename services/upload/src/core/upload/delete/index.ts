import { yellow } from "chalk";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function deleteControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "delete" });
  ctx.logger.info(`[${yellow("DeleteController")}] dependencies initialized`);
  return exceptionLayer.catch(controller.handle.bind(controller));
}
