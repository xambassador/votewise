import { OperationNotAllowedError } from "@votewise/errors";

import { ExceptionLayer } from "@/lib/exception-layer";

const notAllowedMethods = ["POST", "PUT", "DELETE", "PATCH"];

export function sandboxMiddlewareFactory() {
  const exceptionLayer = new ExceptionLayer({ name: "sandbox-middleware" });
  return exceptionLayer.catch(async (req, res, next) => {
    res.setHeader("X-Sandbox-Mode", "true");

    if (notAllowedMethods.includes(req.method || "")) {
      throw new OperationNotAllowedError("Modifications are not allowed in sandbox mode");
    }

    next();
  });
}
