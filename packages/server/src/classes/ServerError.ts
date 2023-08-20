import { UNKNOWN_ERROR_CODES } from "@/src/utils";

export default class ServerError extends Error {
  // send in response body
  statusCode: number;

  message: string;

  // if error is unknown, then send 500 status code
  isUnknownError: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = "ServerError";
    this.isUnknownError = UNKNOWN_ERROR_CODES.includes(statusCode);
  }
}
