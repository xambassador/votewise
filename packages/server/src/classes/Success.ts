export default class Success {
  message: string;

  data: unknown;

  public constructor(message: string, data: unknown) {
    this.message = message;
    this.data = data;
  }
}
