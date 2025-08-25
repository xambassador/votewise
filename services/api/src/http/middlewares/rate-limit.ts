import type { IRateLimiterOptions } from "@/lib/rate-limiter";

import { TooManyRequestsError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";
import { RateLimiterRes } from "@/lib/rate-limiter";
import { getIpLocals } from "@/utils/locals";

type Options = IRateLimiterOptions & { calcKey?: (ip: string) => string };

export function rateLimitMiddlewareFactory(path: string, opts: Options) {
  const { calcKey, ...rest } = opts;
  const { rateLimiteManager, environment } = AppContext.getInjectionTokens(["rateLimiteManager", "environment"]);
  const exceptionLayer = new ExceptionLayer({ name: "rate-limit-middleware" });
  return exceptionLayer.catch(async (_, res, next) => {
    const {
      meta: { ip }
    } = getIpLocals(res);
    const key = calcKey ? calcKey(ip) : ip;
    const limiter = rateLimiteManager.register(path, rest);

    if (environment.NODE_ENV === "development") {
      return next();
    }

    try {
      await limiter.consume(key);
    } catch (rateLimitRes) {
      if (rateLimitRes instanceof RateLimiterRes) {
        if (rateLimitRes.msBeforeNext) {
          res.set("Retry-After", `${rateLimitRes.msBeforeNext / 1000}`);
          res.set("RateLimit-Limit", `${limiter.points}`);
          res.set("RateLimit-Remaining", `${rateLimitRes.remainingPoints}`);
          res.set("RateLimit-Reset", `${Math.floor((Date.now() + rateLimitRes.msBeforeNext) / 1000)}`);
          res.set("X-RateLimit-Limit", `${limiter.points}`);
          res.set("X-RateLimit-Remaining", `${rateLimitRes.remainingPoints}`);
          res.set("X-RateLimit-Reset", `${Math.floor((Date.now() + rateLimitRes.msBeforeNext) / 1000)}`);
        }
      }
      throw new TooManyRequestsError(
        "ERROR: Too many requests. Server experiencing user enthusiasm overload. Apply patience liberally."
      );
    }

    return next();
  });
}
