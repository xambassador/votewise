import type { Request } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZSignin } from "@votewise/schemas";

export class Filters {
  constructor() {}

  public parseRequest<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>) {
    const validation = ZSignin.safeParse(req.body);
    if (!validation.success) {
      throw new InvalidInputError(validation.error.errors[0].message);
    }
    return { body: validation.data, query: null, params: null, locals: null };
  }
}
