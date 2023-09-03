import type { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import httpStatusCodes from "http-status-codes";

import ErrorResponse from "@/src/classes/ErrorResponse";
import UserService from "@/src/services/user";
import JWTService from "@/src/services/user/jwt";

import env from "@/src/env";

dotenv.config();

const COOKIE_KEY = env.COOKIE_ACCESS_TOKEN_KEY;

const { UNAUTHORIZED } = httpStatusCodes;
const unauthorizedResponse = new ErrorResponse(
  "Unauthorized",
  "You are not authorized to access this resource",
  UNAUTHORIZED
);

export default async function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.headers) {
    return res.status(UNAUTHORIZED).json(unauthorizedResponse);
  }

  let token: undefined | null | string;
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies[COOKIE_KEY as string] || null;
  }

  if (!token) {
    return res.status(UNAUTHORIZED).json(unauthorizedResponse);
  }

  try {
    // TODO: Move jwt payload type to @votewise/types
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
