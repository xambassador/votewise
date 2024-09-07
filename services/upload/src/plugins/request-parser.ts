import type { Request } from "express";
import type { ZodSchema } from "zod";

import { InvalidInputError } from "@votewise/lib/errors";

type RequestParserPluginOptions<Body, Query> = {
  bodySchema: ZodSchema<Body>;
  querySchema?: ZodSchema<Query>;
};

type ParseResult<Body, Query> = Query extends null ? { body: Body } : { body: Body; query: Query };

class RequestParser<Body, Query> {
  constructor(private readonly _schemas: RequestParserPluginOptions<Body, Query>) {}

  public parseRequest(request: Request): ParseResult<Body, Query> {
    const body = request.body;
    const { bodySchema, querySchema } = this._schemas;
    const result = bodySchema.safeParse(body);
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Invalid input";
      throw new InvalidInputError(message);
    }

    if (querySchema) {
      const query = request.query;
      const queryResult = querySchema.safeParse(query);
      if (!queryResult.success) {
        const message = queryResult.error.errors[0]?.message ?? "Invalid input";
        throw new InvalidInputError(message);
      }

      return { body: result.data, query: queryResult.data } as ParseResult<Body, Query>;
    }

    return { body: result.data } as ParseResult<Body, Query>;
  }
}

export class RequestParserPlugin {
  private readonly _pool: Map<string, RequestParserPluginOptions<unknown, unknown>> = new Map();

  public getParser<Body, Query>(bodySchema: ZodSchema<Body>, querySchema?: ZodSchema<Query>) {
    const key = `${bodySchema.toString()}${querySchema?.toString()}`;
    if (this._pool.has(key)) {
      return this._pool.get(key) as unknown as RequestParser<Body, Query>;
    }
    const parser = new RequestParser({ bodySchema, querySchema });
    return parser;
  }
}

export function requestParserPluginFactory(): RequestParserPlugin {
  return new RequestParserPlugin();
}
