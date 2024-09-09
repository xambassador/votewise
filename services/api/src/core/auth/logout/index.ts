import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function logoutControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["sessionManager", "assert"]);
  const controller = new Controller({ sessionManager: ctx.sessionManager, assert: ctx.assert });
  const exceptionLayer = new ExceptionLayer({ name: "logout" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
