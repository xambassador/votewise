import type { AccessTokenPayload, SignOptions } from "@votewise/jwt";

import { JWT } from "@votewise/jwt";

type JWTServiceOptions = {
  accessTokenSecret: string;
};

export type RidPayload = { verification_code: string; email: string };

export class JWTService {
  private readonly jwt: JWT;

  constructor(opts: JWTServiceOptions) {
    this.jwt = new JWT({ accessTokenSecret: opts.accessTokenSecret });
  }

  public signAccessToken(payload: AccessTokenPayload, options?: SignOptions) {
    return this.jwt.signAccessToken(payload, options);
  }

  public verifyAccessToken(token: string) {
    return this.jwt.verifyAccessToken(token);
  }

  public decodeAccessToken(token: string) {
    return this.jwt.decode<AccessTokenPayload>(token);
  }

  public signRid(payload: RidPayload, key: string, options?: SignOptions) {
    return this.jwt.sign(payload, key, options);
  }

  public verifyRid(token: string, key: string) {
    return this.jwt.verify<RidPayload>(token, key);
  }
}
