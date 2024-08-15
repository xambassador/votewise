import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { DeleteFilters } from "./filter";

export function deleteControllerFactory(ctx: AppContext) {
  const controller = new Controller({ ctx, filters: new DeleteFilters() });
  const exceptionLayer = new ExceptionLayer({ ctx, name: "delete" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
