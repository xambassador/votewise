import type { Locals } from "@/types";

import { AuthenticationError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";

export function authMiddlewareFactory() {
  const ctx = AppContext.getInjectionTokens(["jwtService", "sessionManager", "repositories"]);
  const exceptionLayer = new ExceptionLayer({ name: "auth-middleware" });
  return exceptionLayer.catch(async (req, res, next) => {
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

    const validate = ctx.jwtService.verifyAccessToken(token);
    if (!validate.success) {
      throw new AuthenticationError("Unauthorized");
    }

    const { user_id, session_id } = validate.data;
    const locals = res.locals as Locals;

    const session = await ctx.sessionManager.getSession(user_id, session_id);
    if (!session || Object.keys(session).length === 0) {
      throw new AuthenticationError("Unauthorized");
    }

    if (session.ip !== locals.meta.ip) {
      throw new AuthenticationError("Unauthorized");
    }

    const userFromSession = await ctx.sessionManager.getUserFromSession(user_id);
    if (!userFromSession) {
      const user = await ctx.repositories.user.findById(user_id);
      if (!user) throw new AuthenticationError("Unauthorized");
      await ctx.sessionManager.setUserToSession(user_id, { email: user.email, username: user.user_name });
      locals.session = { accessToken: validate.data, user: { email: user.email, username: user.user_name } };
    } else {
      locals.session = { accessToken: validate.data, user: userFromSession };
    }

    res.locals = locals;

    return next();
  });
}
