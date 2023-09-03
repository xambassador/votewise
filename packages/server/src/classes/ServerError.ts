import { UNKNOWN_ERROR_CODES } from "@/src/utils";

/**
 * Custom error class for throwing server errors. It can be known or unknown
 * errors.
 */
export default class ServerError extends Error {
  /** Status code of the response */
  statusCode: number;

  /** Error message */
  message: string;

  /**
   * Is the error unknown or not. If it is unknown, then it will set to true and
   * global error handler will handle it as status code 500.
   */
  isUnknownError: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = "ServerError";
    this.isUnknownError = UNKNOWN_ERROR_CODES.includes(statusCode);
  }
}
