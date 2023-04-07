import type { NextFunction, Request, Response } from "express";

import { logger } from "@votewise/lib/logger";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger(err, "error");
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  const errorReason = err.reason || message;
  const response = {
    success: false,
    data: null,
    error: {
      message: errorReason,
    },
    message,
  };
  res.status(status).json(response);
};
