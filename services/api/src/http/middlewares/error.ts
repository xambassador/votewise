import type { NextFunction, Request, Response } from "express";

import * as Errors from "@votewise/lib/errors";

import { ErrorResponse } from "@/utils/index";

const errorTypes = [
  Errors.AuthenticationError,
  Errors.AuthorizationError,
  Errors.DatabaseError,
  Errors.InternalServerError,
  Errors.InvalidInputError,
  Errors.OperationNotAllowedError,
  Errors.ResourceNotFoundError,
  Errors.ValidationError,
  Errors.UnknowError,
];

const INTERNAL_SERVER_ERROR = "InternalServerError";
const INTERNAL_SERVER_ERROR_MSG = "Internal Server Error";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export function error(err: unknown, req: Request, res: Response, next: NextFunction) {
  for (const errorType of errorTypes) {
    if (err instanceof errorType) {
      const { statusCode, message, name } = err;
      const response = new ErrorResponse(statusCode, message, name);
      return res.status(statusCode).json(response);
    }
  }

  const response = new ErrorResponse(500, INTERNAL_SERVER_ERROR_MSG, INTERNAL_SERVER_ERROR);
  return res.status(500).json(response);
}
