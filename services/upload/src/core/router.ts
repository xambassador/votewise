import { Router } from "express";

import { upload } from "@votewise/constant/routes";

import { getAvatarsControllerFactory, getBgControllerFactory } from "./assets";
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
  router.post(upload.paths.handshake(basePath), ...handshakeControllerFactory());
  router.post(upload.paths.upload(basePath), ...uploadControllerFactory());
  router.get(upload.paths.status(basePath), ...statusControllerFactory());
  router.delete(upload.paths.delete(basePath), ...deleteControllerFactory());
  router.get(upload.paths.getAvatars(basePath), ...getAvatarsControllerFactory());
  router.get(upload.paths.getBackgrounds(basePath), ...getBgControllerFactory());
  return router;
}
