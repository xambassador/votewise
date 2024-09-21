import type { AppContext } from "@/context";

import { InvalidInputError } from "@votewise/errors";

type JWTPluginOptions = {
  jwtService: AppContext["jwtService"];
};

export class JWTPlugin {
  constructor(private readonly ctx: JWTPluginOptions) {}

  parse(data: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = data;
    const result = this.ctx.jwtService.verifyAccessToken(accessToken);
    if (!result.success && result.error === "MALFORMED_TOKEN") {
      throw new InvalidInputError("Invalid access token");
    }

    const refreshTokenResult = this.ctx.jwtService.verifyRefreshToken(refreshToken);
    if (!refreshTokenResult.success && refreshTokenResult.error === "MALFORMED_TOKEN") {
      throw new InvalidInputError("Invalid refresh token");
    }

    const decodedAccessToken = this.ctx.jwtService.decodeAccessToken(accessToken);
    const decodedRefreshToken = this.ctx.jwtService.decodeAccessToken(refreshToken);

    if (decodedAccessToken.user_id !== decodedRefreshToken.user_id) {
      throw new InvalidInputError("Invalid refresh token");
    }

    return { access_token: decodedAccessToken, refresh_token: decodedRefreshToken };
  }
}

export function jwtPluginFactory(ctx: JWTPluginOptions): JWTPlugin {
  return new JWTPlugin(ctx);
}
