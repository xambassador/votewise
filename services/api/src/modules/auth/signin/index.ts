import type { AppContext } from "@/context";

import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { Filters } from "./filter";
import { EmailStrategy, UsernameStrategy } from "./strategies";

export function singinControllerFactory(ctx: AppContext) {
  const filters = new Filters();
  const emailStrategy = new EmailStrategy({ userRepository: ctx.repositories.user });
  const usernameStrategy = new UsernameStrategy({ userRepository: ctx.repositories.user });
  const strategies = { email: emailStrategy, username: usernameStrategy };
  const controller = new Controller({
    filters,
    strategies,
    jwtService: ctx.jwtService,
    cryptoService: ctx.cryptoService,
    assert: ctx.assert,
    sessionManager: ctx.sessionManager
  });
  const exceptionLayer = new ExceptionLayer({ name: "signin", ctx });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
