import type { Locals } from "@/types";
import type { Request, Response } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZVerifyEmail } from "@votewise/schemas";

export class Filters {
  constructor() {}

  public parseRequest(req: Request, res: Response) {
    const body = req.body;
    const validate = ZVerifyEmail.safeParse(body);
    if (!validate.success) {
      const message = validate.error.errors[0].message;
      throw new InvalidInputError(message);
    }
    const locals = res.locals as Locals;
    return { body: validate.data, query: null, params: null, locals };
  }
}
