import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function createFeedControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories", "plugins"]);
  const controller = new Controller({
    feedRepository: ctx.repositories.feed,
    requestParser: ctx.plugins.requestParser
  });
  const exceptionLayer = new ExceptionLayer({ name: "create-feed" });
  return exceptionLayer.catch(controller.handle.bind(controller));
}
