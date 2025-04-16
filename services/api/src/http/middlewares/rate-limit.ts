import type { IRateLimiterOptions } from "@/lib/rate-limiter";

import { TooManyRequestsError } from "@votewise/errors";

import { AppContext } from "@/context";
import { ExceptionLayer } from "@/lib/exception-layer";
import { RateLimiterRes } from "@/lib/rate-limiter";
import { getIpLocals } from "@/utils/locals";

export function rateLimitMiddlewareFactory(path: string, opts: IRateLimiterOptions) {
  const rateLimiteManager = AppContext.getInjectionToken("rateLimiteManager");
  const exceptionLayer = new ExceptionLayer({ name: "rate-limit-middleware" });
  return exceptionLayer.catch(async (_, res, next) => {
    const {
      meta: { ip }
    } = getIpLocals(res);
    const limiter = rateLimiteManager.register(path, opts);
    try {
      await limiter.consume(ip);
    } catch (rateLimitRes) {
      if (rateLimitRes instanceof RateLimiterRes) {
        if (rateLimitRes.msBeforeNext) {
          res.set("Retry-After", `${rateLimitRes.msBeforeNext / 1000}`);
          res.set("RateLimit-Limit", `${limiter.points}`);
          res.set("RateLimit-Remaining", `${rateLimitRes.remainingPoints}`);
          res.set("RateLimit-Reset", `${new Date(Date.now() + rateLimitRes.msBeforeNext)}`);
          res.set("X-RateLimit-Limit", `${limiter.points}`);
          res.set("X-RateLimit-Remaining", `${rateLimitRes.remainingPoints}`);
          res.set("X-RateLimit-Reset", `${new Date(Date.now() + rateLimitRes.msBeforeNext)}`);
        }
      }
      throw new TooManyRequestsError(
        `Rate limit exceeded for ${path} with ${opts.points} points per ${opts.duration} seconds`
      );
    }

    return next();
  });
}
