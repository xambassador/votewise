/** Create json response for error cases */
export default class ErrorResponse {
  /** Error message */
  error: string;

  /** General message */
  message: string;

  /** Status code of the response */
  statusCode: number;

  public constructor(error: string, message: string, statusCode: number) {
    this.error = error;
    this.message = message;
    this.statusCode = statusCode;
  }
}
