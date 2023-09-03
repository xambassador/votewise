import { VALIDATION_ERROR_CODE } from "@/src/utils";

/**
 * Custom error class for throwing validation errors. Just a wrapper around
 * `ServerError` class(In global error handler, information from `ValidationError`
 * class is extracted and pass it to `ServerError`).
 */
export default class ValidationError extends Error {
  statusCode = VALIDATION_ERROR_CODE;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.message = message;
  }
}
