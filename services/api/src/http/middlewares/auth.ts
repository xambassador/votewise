import type { Locals } from "@/types";
import type { Request } from "express";

import { AuthenticationError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

export function authMiddlewareFactory() {
  const ctx = AppContext.getInjectionTokens(["jwtService", "sessionManager", "repositories"]);
  const exceptionLayer = new ExceptionLayer({ name: "auth-middleware" });
  return exceptionLayer.catch(async (req, res, next) => {
    const token = getAuthorizationToken(req);
    const validate = ctx.jwtService.verifyAccessToken(token);
    if (!validate.success) throw new AuthenticationError("Unauthorized");

    const { user_id, session_id } = validate.data;
    const locals = res.locals as Locals;

    const session = await ctx.sessionManager.getSession(user_id, session_id);
    if (!session || Object.keys(session).length === 0) {
      throw new AuthenticationError("Unauthorized");
    }

    if (session.ip !== locals.meta.ip) {
      throw new AuthenticationError("Unauthorized");
    }

    locals.session = {
      accessToken: validate.data,
      user: {
        email: session.email,
        is_2fa_enabled: session.is_2fa_enabled,
        ip: session.ip,
        is_2fa_verified: session.is_2fa_enabled === "true" ? session.is_2fa_verified : "false",
        username: session.username,
        user_agent: session.user_agent
      }
    };
    res.locals = locals;

    return next();
  });
}

function getAuthorizationToken(req: Request) {
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
