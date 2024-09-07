import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function uploadControllerFactory(ctx: AppContext) {
  const controller = new Controller({ ctx });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "upload" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
