import { StatusCodes } from "http-status-codes";

class BaseController {
  protected statusCodes = StatusCodes;

  constructor() {}
}

export { BaseController };
