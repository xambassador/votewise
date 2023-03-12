/**
 * @file: healthCheck.ts
 * @description: Application health check routes
 */
import type { Request, Response } from "express";
import { Router } from "express";

import { HEALTH_CHECK, PING } from "@votewise/lib";

import { JSONResponse } from "@/src/lib";

// -----------------------------------------------------------------------------------------

const router = Router();

// GET /health-check
router.get(HEALTH_CHECK, (req: Request, res: Response) => {
  const response = new JSONResponse("OK", { healthCheck: "OK" }, null, true);
  res.status(200).json(response);
});

// GET /ping
router.get(PING, (req: Request, res: Response) => {
  const response = new JSONResponse("pong", { ping: "pong" }, null, true);
  res.status(200).json(response);
});

export default router;
