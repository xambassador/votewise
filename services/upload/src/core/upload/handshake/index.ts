import { yellow } from "chalk";

import { AppContext } from "@/context";
import { authMiddlewareFactory } from "@/http/middlewares/auth";
import { ExceptionLayer } from "@/lib/exception-layer";

import { Controller } from "./controller";

export function handshakeControllerFactory() {
  const ctx = AppContext.instance;
  const controller = new Controller({ ctx });
  const auth = authMiddlewareFactory();
  const exceptionLayer = new ExceptionLayer({ ctx, name: "handshake" });
  ctx.logger.info(`[${yellow("HandshakeController")}] dependencies initialized`);
  return [auth, exceptionLayer.catch(controller.handle.bind(controller))];
}
