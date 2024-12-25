import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function onboardControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories", "plugins"]);
  const controller = new Controller({
    assert: ctx.assert,
    requestParser: ctx.plugins.requestParser,
    userRepository: ctx.repositories.user
  });
  const exceptionLayer = new ExceptionLayer({ name: "onboard" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
