import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getOnboardStatusControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories"]);
  const controller = new Controller({
    assert: ctx.assert,
    userRepository: ctx.repositories.user
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-onboard-status" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
