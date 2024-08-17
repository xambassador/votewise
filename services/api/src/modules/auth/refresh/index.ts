import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Filters } from "./filter";

export function refreshControllerFactory(ctx: AppContext) {
  const filters = new Filters({ jwtService: ctx.jwtService });
  const controller = new Controller({
    filters,
    assert: ctx.assert,
    useRepository: ctx.repositories.user,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "refresh", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
