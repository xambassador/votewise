import type { AppContext } from "@/http/context";

import { Controller } from "./controller";
import { Service } from "./service";

export function createRegisterController(ctx: AppContext) {
  const service = new Service({
    cache: ctx.cache,
    cryptoService: ctx.cryptoService,
    userRepository: ctx.repositories.user,
    httpStatusCodes: ctx.httpStatusCodes,
    mailer: ctx.mailer
  });
  const controller = new Controller({ service });
  return controller;
}
