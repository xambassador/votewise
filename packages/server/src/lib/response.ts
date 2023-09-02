/**
 * @deprecated
 */
class JSONResponse {
  public message: string;

  public data: object | null;

  public error: object | null;

  public success: boolean;

  constructor(message: string, data: object | null, error: object | null, success: boolean) {
    this.message = message;
    this.data = data;
    this.error = error;
    this.success = success;
  }
}

export { JSONResponse };
