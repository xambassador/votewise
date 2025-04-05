import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllFeedControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "repositories"]);
  const controller = new Controller({ assert: ctx.assert, timelineRepository: ctx.repositories.timeline });
  const exceptionLayer = new ExceptionLayer({ name: "get-all-feed" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
