import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { StatusFilters } from "./filter";

export function statusControllerFactory(ctx: AppContext) {
  const controller = new Controller({ ctx, filters: new StatusFilters() });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "status" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
