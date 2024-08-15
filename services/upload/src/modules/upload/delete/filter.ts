import type { Request } from "express";

import { InvalidInputError } from "@votewise/lib/errors";

export class DeleteFilters {
  constructor() {}

  public parseRequest<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>) {
    const query = req.query as { file_name?: string };
    const params = req.params as { token?: string };
    const fileName = query.file_name;
    const token = params.token;
    if (!fileName) {
      throw new InvalidInputError("file_name is required");
    }
    if (!token) {
      throw new InvalidInputError("token is required");
    }
    return { body: { fileName, token }, locals: null };
  }
}
