import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function statusControllerFactory(ctx: AppContext) {
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "status" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
