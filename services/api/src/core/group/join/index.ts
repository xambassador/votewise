import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";
import { PrivateGroupStrategy, PublicGroupStrategy } from "./strategies";

export function joinGroupControllerFactory() {
  const ctx = AppContext.instance;
  const publicGroupStrategy = new PublicGroupStrategy(ctx);
  const privateGroupStrategy = new PrivateGroupStrategy(ctx);
  const controller = new Controller({
    ...ctx,
    strategies: {
      private: privateGroupStrategy,
      public: publicGroupStrategy
    }
  });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ name: "join-group" });
  ctx.logger.info(`[${yellow("JoinGroupController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
