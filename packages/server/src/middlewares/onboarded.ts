import type { NextFunction, Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import ErrorResponse from "@/src/classes/ErrorResponse";
import { ONBOARDING_ERROR_CODE } from "@/src/utils";

// eslint-disable-next-line consistent-return
export default function onboarded(req: Request, res: Response, next: NextFunction) {
  const { user } = req.session;

  if (!user.onboarded) {
    const message = "User is not onboarded";
    const response = new ErrorResponse(message, message, ONBOARDING_ERROR_CODE);
    return res.status(httpStatusCodes.BAD_REQUEST).json(response);
  }

  // TODO: Uncomment this
  //   if (!user.is_email_verify) {
  //     return res.status(httpStatusCodes.BAD_REQUEST).json({
  //       message: "Email is not verified",
  //       data: null,
  //       error: {
  //         message: "Email is not verified. Please verify your email to continue.",
  //       },
  //       success: false,
  //     });
  //   }

  next();
}
