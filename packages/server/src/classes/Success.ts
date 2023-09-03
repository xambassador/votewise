/** Success class for sending success response */
export default class Success {
  /** General message */
  message: string;

  /** Response data */
  data: unknown;

  public constructor(message: string, data: unknown) {
    this.message = message;
    this.data = data;
  }
}
