import type { Request } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZRegister } from "@votewise/schemas";

export class RegisterFilters {
  constructor() {}

  public parseRequest<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>) {
    const body = req.body;
    const query = req.query as null;
    const params = req.params as null;
    const validate = ZRegister.safeParse(body);
    if (!validate.success) {
      const message = validate.error.errors[0].message;
      throw new InvalidInputError(message);
    }
    return { body: validate.data, query, params, locals: {} };
  }
}
