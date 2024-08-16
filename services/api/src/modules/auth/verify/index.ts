import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Filters } from "./filter";

export function verifyControllerFactory(ctx: AppContext) {
  const filters = new Filters();
  const controller = new Controller({
    userRepository: ctx.repositories.user,
    filters,
    cache: ctx.cache,
    assert: ctx.assert
  });
  const exceptionLayer = new ExceptionLayer({ name: "verify-email", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
