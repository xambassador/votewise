import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllTopicsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["repositories"]);
  const controller = new Controller({
    topicRepository: ctx.repositories.topic
  });
  const exceptionLayer = new ExceptionLayer({ name: "get-all-topics" });
  return [exceptionLayer.catch(controller.handle.bind(controller))];
}
