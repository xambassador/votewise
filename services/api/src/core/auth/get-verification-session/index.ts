import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getVerificationSessionControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["cache", "assert"]);
  const controller = new Controller({
    cache: ctx.cache,
    assert: ctx.assert
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-verification-session" });
  return [exceptionLayer.catch(controller.handle.bind(controller))];
}
