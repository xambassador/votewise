import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getSession } from "@/src/services/session";
import { UNAUTHORIZED_MSG } from "../utils";

export default async function csrf(req: Request, res: Response, next: NextFunction) {
  // Extract the token from the request
  const token =
    req.body._csrf || req.query._csrf || req.headers["x-csrf-token"] || req.headers["x-xsrf-token"];

  const { user } = req.session;

  const session = await getSession(`user:${user.id}`);
  // Compare the token to the one in the session
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: UNAUTHORIZED_MSG });
  }

  if (session.csrfToken !== token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: UNAUTHORIZED_MSG });
  }

  return next();
}
