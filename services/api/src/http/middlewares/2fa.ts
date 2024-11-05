import { AuthenticationError } from "@votewise/errors";
import { codes } from "@votewise/errors/codes";

import { ExceptionLayer } from "@/lib/exception-layer";
import { getAuthenticateLocals } from "@/utils/locals";

export function twoFactorAuthMiddlewareFactory() {
  const exceptionLayer = new ExceptionLayer({ name: "2fa-middleware" });
  return exceptionLayer.catch(async (_, res, next) => {
    const locals = getAuthenticateLocals(res);
    const { session } = locals;

    if (session.user.is_2fa_enabled === "true" && session.user.is_2fa_verified === "false") {
      throw new AuthenticationError("2FA verification is required", codes["2FA_VERIFICATION_REQIURED"]);
    }

    return next();
  });
}
