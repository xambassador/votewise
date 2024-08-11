import type { AppContext } from "@/context";

import { Router } from "express";

import {
  deleteControllerFactory,
  handshakeControllerFactory,
  statusControllerFactory,
  uploadControllerFactory
} from "./upload";

/**
 * This function creates a router for each module in the application and returns a single router instance that
 * contains all the module routers. So, this function is the entry point for every single routes in the application.
 *
 * @param {string} basePath - The base path for the router. Default is "/api"
 * @param {AppContext} ctx - The application context
 * @returns {Router} - Express router
 */
export function moduleRouterFactory(basePath: string, ctx: AppContext) {
  const router = Router();
  router.post(basePath + "/handshake", handshakeControllerFactory(ctx));
  router.post(basePath + "/upload", uploadControllerFactory(ctx));
  router.get(basePath + "/upload/:token/status", statusControllerFactory(ctx));
  router.delete(basePath + "/upload/:token", deleteControllerFactory(ctx));
  return router;
}
