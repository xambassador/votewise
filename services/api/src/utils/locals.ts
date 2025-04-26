import type { Response } from "express";

export function getAuthenticateLocals(res: Response): Locals {
  const locals = res.locals as Locals;

  if (!locals) {
    throw new Error(
      "Locals not found. You are accessing locals without authentication. Make sure you have added auth middleware."
    );
  }

  if (!locals.meta || !locals.meta.ip) {
    throw new Error("Locals meta.ip not found. This should not happen. Check ip middleware.");
  }

  if (!locals.session) {
    throw new Error(
      "Locals session not found. You are accessing locals without authentication. Make sure you have added auth middleware."
    );
  }

  return locals;
}

export function getIpLocals(res: Response): Locals {
  const locals = res.locals as Locals;

  if (!locals) {
    throw new Error("Locals not found.");
  }

  if (!locals.meta || !locals.meta.ip) {
    throw new Error("Locals meta.ip not found. This should not happen. Check ip middleware.");
  }

  return locals;
}
