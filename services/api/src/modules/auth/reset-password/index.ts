import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Filters } from "./filter";

export function resetPasswordControllerFactory(ctx: AppContext) {
  const filters = new Filters();
  const controller = new Controller({
    filters,
    userRepository: ctx.repositories.user,
    jwtService: ctx.jwtService,
    assert: ctx.assert,
    cryptoService: ctx.cryptoService
  });
  const exceptionLayer = new ExceptionLayer({ name: "reset-password", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
