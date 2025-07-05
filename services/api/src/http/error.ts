import type { ErrorRequestHandler } from "express";
import type { AppContext } from "../context";

import * as Errors from "@votewise/errors";

const errorTypes = [
  Errors.ResourceNotFoundError,
  Errors.InvalidInputError,
  Errors.ValidationError,
  Errors.BadRequestError,
  Errors.OperationNotAllowedError,
  Errors.AuthenticationError,
  Errors.InternalServerError,
  Errors.UnprocessableEntityError,
  Errors.ConflictError,
  Errors.TooManyRequestsError
];

const serverErrors = [Errors.UnknownError, Errors.DatabaseError];

const INTERNAL_SERVER_ERROR = "InternalServerError";
const INTERNAL_SERVER_ERROR_MSG = "Internal Server Error";

class ErrorResponse {
  status_code: number;
  message: string;
  name: string;
  error_code?: number;

  constructor(statusCode: number, message: string, name: string, errorCode?: number) {
    this.status_code = statusCode;
    this.message = message;
    this.name = name;
    this.error_code = errorCode;
  }
}

export const handler: ErrorRequestHandler = (err, _req, res, next) => {
  // to avoid sending headers twice
  if (res.headersSent) {
    return next(err);
  }

  for (const errorType of errorTypes) {
    if (err instanceof errorType) {
      const { statusCode, message, name, errorCode } = err;
      const response = new ErrorResponse(statusCode, message, name, errorCode);
      return res.status(statusCode).json({ error: response });
    }
  }

  for (const errorType of serverErrors) {
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
