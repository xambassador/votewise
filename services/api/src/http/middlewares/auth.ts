import { ERROR_CODES } from "@votewise/constant";
import { AuthenticationError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";
import { getAuthorizationToken } from "@/utils/header";

export function authMiddlewareFactory() {
  const ctx = AppContext.getInjectionTokens(["services", "repositories"]);
  const exceptionLayer = new ExceptionLayer({ name: "auth-middleware" });
  return exceptionLayer.catch(async (req, res, next) => {
    const token = getAuthorizationToken(req);
    const validate = ctx.services.jwt.verifyAccessToken(token);
    if (!validate.success) {
      if (validate.error === "TOKEN_EXPIRED") {
        throw new AuthenticationError("Unauthorized", ERROR_CODES.AUTH.ACCESS_TOKEN_EXPIRED);
      }
      throw new AuthenticationError("Unauthorized");
    }
    const payload = validate.data;
    const session = await ctx.services.session.get(payload.session_id);
    if (!session) throw new AuthenticationError("Unauthorized");
    res.locals = { ...res.locals, session, payload } as Locals;
    return next();
  });
}
