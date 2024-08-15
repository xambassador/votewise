import type { Request } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZHandshake } from "@votewise/schemas";

export class HandshakeFilters {
  constructor() {}

  public parseRequest<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>) {
    const validate = ZHandshake.safeParse(req.body);
    const query = req.query as null;
    const params = req.params as null;
    if (!validate.success) {
      throw new InvalidInputError(validate.error.errors[0].message);
    }
    return { body: validate.data, query, params, locals: null };
  }
}
