/**
 * @file: user.ts
 * @description: Contains all users related controllers
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import { JSONResponse } from "@/src/lib";
import UserService from "@/src/services/user";
import { getErrorReason } from "@/src/utils";

const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------------------
export const getMyDetails = (req: Request, res: Response) => {
  const { user } = req.session;
  try {
    return res.status(OK).json(
      new JSONResponse(
        "User details fetched successfully",
        {
          message: "Get user details",
          user,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err);
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        "Something went wrong",
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};
