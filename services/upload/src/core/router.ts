import { Router } from "express";

import {
  deleteControllerFactory,
  handshakeControllerFactory,
  statusControllerFactory,
  uploadControllerFactory
} from "./upload";

/**
 * Factory function to create an application router for the specified base path.
 *
 * @default basePath "/api"
 * @param {string} basePath - The base path for the router.
 * @returns {Router} - Express router
 */
export function moduleRouterFactory(basePath: string): Router {
  const router = Router();
  router.post(basePath + "/handshake", handshakeControllerFactory());
  router.post(basePath + "/upload", uploadControllerFactory());
  router.get(basePath + "/upload/:token/status", statusControllerFactory());
  router.delete(basePath + "/upload/:token", deleteControllerFactory());
  return router;
}
