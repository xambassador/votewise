import { VALIDATION_ERROR_CODE } from "@/src/utils";

export default class ValidationError extends Error {
  statusCode = VALIDATION_ERROR_CODE;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.message = message;
  }
}
