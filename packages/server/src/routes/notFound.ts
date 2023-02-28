import type { Request, Response } from "express";
import { Router } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "@/src/lib";

const router = Router();

router.all("*", (req: Request, res: Response) => {
  const { method, originalUrl } = req;
  const message = `Cannot ${method} ${originalUrl}. Please check the correct API endpoints.`;
  const response = new JSONResponse(message, null, { message }, false);
  res.status(httpStatusCodes.NOT_FOUND).json(response);
});

export default router;
