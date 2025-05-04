import type { Response } from "express";

export function getAuthenticateLocals(res: Response): Locals {
  const locals = res.locals as Locals;

  if (!locals) {
    throw new Error(
      "Locals not found. You are accessing locals without authentication. Make sure you have added auth middleware."
    );
  }

  if (!locals.payload) {
    throw new Error(
      "Locals payload not found. You are accessing locals without authentication. Make sure you have added auth middleware."
    );
  }

  return locals;
}
