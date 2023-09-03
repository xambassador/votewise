import type { NextFunction, Request, Response } from "express";

import ErrorResponse from "@/src/classes/ErrorResponse";
import ServerError from "@/src/classes/ServerError";
import ValidationError from "@/src/classes/ValidationError";
import { VALIDATION_FAILED_MSG } from "@/src/utils";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: any, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    const status = 400;
    const { message } = err;
    const response = new ErrorResponse(message, VALIDATION_FAILED_MSG, status);
    return res.status(status).json(response);
  }

  if (err instanceof ServerError) {
    const status = err.isUnknownError ? 500 : err.statusCode;
    const { message } = err;
    const response = new ErrorResponse(message, message, status);
    return res.status(status).json(response);
  }

  // If error is unknown.
  const status = 500;
  const message = err.message || "Internal Server Error";
  const response = new ErrorResponse(message, message, status);
  return res.status(status).json(response);
};
