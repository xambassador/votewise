import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import ErrorResponse from "@/src/classes/ErrorResponse";
import { ONBOARDING_ERROR_CODE } from "@/src/utils";

// eslint-disable-next-line consistent-return
export default function onboarded(req: Request, res: Response, next: NextFunction) {
  const { user } = req.session;

  if (!user.onboarded) {
    const message = "User is not onboarded";
    const response = new ErrorResponse(message, message, ONBOARDING_ERROR_CODE);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }

  if (!user.is_email_verify) {
    const message = "Email is not verified";
    const response = new ErrorResponse(message, message, StatusCodes.BAD_REQUEST);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }

  next();
}
