import { ERROR_CODES } from "@votewise/constant";
import { AuthenticationError } from "@votewise/errors";

import { ExceptionLayer } from "@/lib/exception-layer";
import { getAuthenticateLocals } from "@/utils/locals";

const mfaRequiredMessage =
  "Multi factor authentication is required. Please create a new challenge and verify it to continue.";

export function twoFactorAuthMiddlewareFactory() {
  const exceptionLayer = new ExceptionLayer({ name: "2fa-middleware" });
  return exceptionLayer.catch(async (_, res, next) => {
    const locals = getAuthenticateLocals(res);
    const { session, payload } = locals;
    const currentAAL = payload.aal;
    const nextAAL = session.aal;
    if (currentAAL !== nextAAL) {
      throw new AuthenticationError(mfaRequiredMessage, ERROR_CODES["2FA"].VERIFICATION_REQUIRED);
    }
    return next();
  });
}
