import type { AppContext } from "@/context";

import { InvalidInputError } from "@votewise/errors";

type JWTPluginOptions = {
  jwtService: AppContext["services"]["jwt"];
};

export class JWTPlugin {
  constructor(private readonly ctx: JWTPluginOptions) {}

  parse(data: { accessToken: string }) {
    const { accessToken } = data;
    const result = this.ctx.jwtService.verifyAccessToken(accessToken);
    if (!result.success && result.error === "MALFORMED_TOKEN") {
      throw new InvalidInputError("Invalid access token");
    }
    const decodedAccessToken = this.ctx.jwtService.decodeAccessToken(accessToken);
    return { access_token: decodedAccessToken };
  }
}

export function jwtPluginFactory(ctx: JWTPluginOptions): JWTPlugin {
  return new JWTPlugin(ctx);
}
