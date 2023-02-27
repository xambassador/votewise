/**
 * @file: auth.ts
 * @description: Authentication middleware.
 */
import type { Request, Response, NextFunction } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "../lib";
import UserService from "../services/user";
import JWTService from "../services/user/jwt";

const { UNAUTHORIZED } = httpStatusCodes;
const error = {
  message: "Unauthorized",
};
const unauthorizedResponse = new JSONResponse("Unauthorized", null, error, false);

export default async function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.headers) {
    return res.status(UNAUTHORIZED).json(unauthorizedResponse);
  }

  let token: undefined | null | string;
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.token || null;
  }

  if (!token) {
    return res.status(UNAUTHORIZED).json(unauthorizedResponse);
  }

  try {
    const { userId } = JWTService.verifyAccessToken(token) as { userId: number };
    const user = await UserService.checkIfUserExists(userId);
    if (!user) {
      return res.status(UNAUTHORIZED).json(unauthorizedResponse);
    }
    req.session = { user };
    return next();
  } catch (err) {
    return res.status(UNAUTHORIZED).json(unauthorizedResponse);
  }
}
