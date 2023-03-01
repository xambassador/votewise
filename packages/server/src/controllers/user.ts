/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "@/src/lib";
import UserService from "@/src/services/user";

const { BAD_REQUEST, OK } = httpStatusCodes;

export const checkUsernameAvailability = async (req: Request, res: Response) => {
  const { username } = req.query as { username: string };

  if (!username) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Validation failed",
        null,
        {
          message: "Username is required",
        },
        false
      )
    );
  }

  const user = await UserService.checkIfUsernameExists(username);

  if (user) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Username is already taken",
        null,
        {
          message: "Username is already taken",
        },
        false
      )
    );
  }

  return res.status(OK).json(
    new JSONResponse(
      "Username is available",
      {
        username,
        message: `Username ${username} is available`,
      },
      null,
      true
    )
  );
};
