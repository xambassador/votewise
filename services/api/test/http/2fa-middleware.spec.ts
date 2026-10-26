import { ERROR_CODES } from "@votewise/constant";
import { AuthenticationError } from "@votewise/errors";

import { twoFactorAuthMiddlewareFactory } from "@/http/middlewares/2fa";

import { buildReq, buildRes, ip } from "../helpers";

jest.mock("@/context", () => ({
  AppContext: {
    getInjectionTokens: () => ({ logger: { error: jest.fn() }, config: { devMode: false } })
  }
}));

async function run(tokenAal: "aal1" | "aal2", sessionAal: "aal1" | "aal2") {
  const middleware = twoFactorAuthMiddlewareFactory();
  const res = buildRes({ locals: { meta: { ip }, payload: { aal: tokenAal }, session: { aal: sessionAal } } });
  const next: jest.Mock = jest.fn();
  await (middleware(buildReq(), res, next) as unknown as Promise<void>);
  return next;
}

describe("2FA middleware", () => {
  test("should block when the user has MFA but the token is aal1", async () => {
    const next = await run("aal1", "aal2");
    const error = next.mock.calls[0]?.[0] as AuthenticationError & { errorCode?: string };
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.errorCode).toBe(ERROR_CODES["2FA"].VERIFICATION_REQUIRED);
  });

  test("should allow when the token is aal2 and the session is aal2", async () => {
    const next = await run("aal2", "aal2");
    expect(next).toHaveBeenCalledWith();
  });

  test("should allow when the user has no MFA (aal1 and aal1)", async () => {
    const next = await run("aal1", "aal1");
    expect(next).toHaveBeenCalledWith();
  });
});
