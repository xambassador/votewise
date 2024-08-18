import type { Locals } from "@/types";
import type { Request, Response } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZForgotPassword } from "@votewise/schemas";

export class Filters {
  constructor() {}

  public parseRequest(req: Request, res: Response) {
    const validate = ZForgotPassword.safeParse(req.body);
    if (!validate.success) {
      throw new InvalidInputError(validate.error.errors[0].message);
    }
    const locals = res.locals as Locals;
    return { body: validate.data, locals, query: null, params: null };
  }
}
