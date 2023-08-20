export default class ErrorResponse {
  error: string;

  message: string;

  statusCode: number;

  public constructor(error: string, message: string, statusCode: number) {
    this.error = error;
    this.message = message;
    this.statusCode = statusCode;
  }
}
