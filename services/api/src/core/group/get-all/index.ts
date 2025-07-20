import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function getAllGroupsControllerFactory() {
  const ctx = AppContext.getInjectionTokens(["assert", "bucketService", "repositories"]);
  const controller = new Controller({
    assert: ctx.assert,
    bucketService: ctx.bucketService,
    groupRepository: ctx.repositories.group
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "get-all-group" });
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
