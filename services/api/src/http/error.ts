import type { ErrorRequestHandler } from "express";
import type { AppContext } from "../context";

import * as Errors from "@votewise/errors";

const errorTypes = [
  Errors.ResourceNotFoundError,
  Errors.InvalidInputError,
  Errors.ValidationError,
  Errors.BadRequestError,
  Errors.UnknowError,
  Errors.DatabaseError,
  Errors.OperationNotAllowedError,
  Errors.AuthenticationError,
  Errors.AuthorizationError,
  Errors.InternalServerError
];

const INTERNAL_SERVER_ERROR = "InternalServerError";
const INTERNAL_SERVER_ERROR_MSG = "Internal Server Error";

class ErrorResponse {
  status_code: number;
  message: string;
  name: string;

  constructor(statusCode: number, message: string, name: string) {
    this.status_code = statusCode;
    this.message = message;
    this.name = name;
  }
}

export const handler: ErrorRequestHandler = (err, _req, res, next) => {
  // to avoid sending headers twice
  if (res.headersSent) {
    return next(err);
  }

  for (const errorType of errorTypes) {
    if (err instanceof errorType) {
      const { statusCode, message, name } = err;
      const response = new ErrorResponse(statusCode, message, name);
      return res.status(statusCode).json({ error: response });
    }
  }

  const response = new ErrorResponse(500, INTERNAL_SERVER_ERROR_MSG, INTERNAL_SERVER_ERROR);
  return res.status(500).json({ error: response });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const withAppContext = (_ctx: AppContext) => {
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => handler(err, req, res, next);
  return { handler: errorHandler };
};
