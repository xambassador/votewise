import type { AppContext } from "@/context";
import type { Locals } from "@/types";
import type { TRefresh } from "@votewise/schemas";
import type { Request, Response } from "express";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZRefresh } from "@votewise/schemas";

type FiltersOptions = {
  jwtService: AppContext["jwtService"];
};

export class Filters {
  private readonly ctx: FiltersOptions;

  constructor(ctx: FiltersOptions) {
    this.ctx = ctx;
  }

  public parseRequest(req: Request, res: Response) {
    const validate = ZRefresh.safeParse(req.body);
    if (!validate.success) {
      throw new InvalidInputError(validate.error.errors[0].message);
    }
    const locals = res.locals as Locals;
    return { body: validate.data, params: null, query: null, locals };
  }

  public parseTokens(data: TRefresh) {
    const { access_token, refresh_token } = data;

    const result = this.ctx.jwtService.verifyAccessToken(access_token);
    if (!result.success && result.error === "MALFORMED_TOKEN") {
      throw new InvalidInputError("Invalid access token");
    }

    const refreshTokenResult = this.ctx.jwtService.verifyRefreshToken(refresh_token);
    if (!refreshTokenResult.success && refreshTokenResult.error === "MALFORMED_TOKEN") {
      throw new InvalidInputError("Invalid refresh token");
    }

    const decodedAccessToken = this.ctx.jwtService.decodeAccessToken(access_token);
    const decodedRefreshToken = this.ctx.jwtService.decodeAccessToken(refresh_token);

    if (decodedAccessToken.user_id !== decodedRefreshToken.user_id) {
      throw new InvalidInputError("Invalid refresh token");
    }

    return { access_token: decodedAccessToken, refresh_token: decodedRefreshToken };
  }
}
