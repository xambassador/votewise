/**
 * @file: auth.ts
 * @description: Authentication middleware.
 */
import type { Request, Response, NextFunction } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "../lib";
import UserService from "../services/user";
import JWTService from "../services/user/jwt";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if token is available in cookies or headers.
  let token: undefined | null | string;
  if (req.headers.authorization) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.token || null;
  }

  if (!token) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json(
      new JSONResponse(
        "Unauthorized",
        null,
        {
          message: "Unauthorized",
        },
        false
      )
    );
  }

  try {
    const { userId } = JWTService.verifyAccessToken(token) as { userId: number };
    const user = await UserService.checkIfUserExists(userId);
    if (!user) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json(
        new JSONResponse(
          "Unauthorized",
          null,
          {
            message: "Unauthorized",
          },
          false
        )
      );
    }
    req.session = { user };
    return next();
  } catch (err) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json(
      new JSONResponse(
        "Unauthorized",
        null,
        {
          message: "Unauthorized",
        },
        false
      )
    );
  }
}
