import type { Locals } from "@/types";
import type { Request, Response } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZSignin } from "@votewise/schemas";

export class Filters {
  constructor() {}

  public parseRequest(req: Request, res: Response) {
    const validation = ZSignin.safeParse(req.body);
    if (!validation.success) {
      throw new InvalidInputError(validation.error.errors[0].message);
    }
    const locals = res.locals as Locals;
    return { body: validation.data, query: null, params: null, locals };
  }
}
