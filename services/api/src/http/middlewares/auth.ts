import type { Request } from "express";

import { ERROR_CODES } from "@votewise/constant";
import { AuthenticationError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";
import { COOKIE_KEYS } from "@/utils/constant";

export function authMiddlewareFactory() {
  const ctx = AppContext.getInjectionTokens(["jwtService", "sessionManager", "repositories"]);
  const exceptionLayer = new ExceptionLayer({ name: "auth-middleware" });
  return exceptionLayer.catch(async (req, res, next) => {
    const token = getAuthorizationToken(req);
    const validate = ctx.jwtService.verifyAccessToken(token);
    if (!validate.success) {
      if (validate.error === "TOKEN_EXPIRED") {
        throw new AuthenticationError("Unauthorized", ERROR_CODES.AUTH.ACCESS_TOKEN_EXPIRED);
      }
      throw new AuthenticationError("Unauthorized");
    }
    const payload = validate.data;
    const session = await ctx.sessionManager.get(payload.session_id);
    if (!session) throw new AuthenticationError("Unauthorized");
    res.locals = { ...res.locals, session, payload } as Locals;
    return next();
  });
}

function getAuthorizationToken(req: Request) {
  const signedCookie = req.signedCookies;
  if (signedCookie && signedCookie[COOKIE_KEYS.accessToken]) {
    return signedCookie[COOKIE_KEYS.accessToken];
  }

  const authorization = req.headers.authorization;
  if (!authorization) {
    throw new AuthenticationError("Authorization header is missing");
  }

  const [prefix, token] = authorization.split(" ");

  if (prefix !== "Bearer" && prefix !== "Votewise") {
    throw new AuthenticationError("Invalid authorization header");
  }

  if (!token) {
    throw new AuthenticationError("Token is missing");
  }

  return token;
}
