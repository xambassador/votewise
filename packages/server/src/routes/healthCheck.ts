import type { Request, Response } from "express";
import { Router } from "express";

import { HEALTH_CHECK, PING } from "@votewise/lib/routes";
import { prisma } from "@votewise/prisma";

import { JSONResponse } from "@/src/lib";

import RedisAdapter from "../redis";

const router = Router();

router.get(HEALTH_CHECK, async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    await prisma.$queryRaw`SELECT 1;`;
    await prisma.$disconnect();
    await RedisAdapter.defaultClient.ping();
    const response = new JSONResponse("OK", { healthCheck: "OK" }, null, true);
    return res.status(200).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: message,
      data: null,
      message: `Not ok`,
    });
  }
});

router.get(PING, (req: Request, res: Response) => {
  const response = new JSONResponse("pong", { ping: "pong" }, null, true);
  res.status(200).json(response);
});

export default router;
