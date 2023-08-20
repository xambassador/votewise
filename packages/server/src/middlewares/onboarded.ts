import type { NextFunction, Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

// eslint-disable-next-line consistent-return
export default function onboarded(req: Request, res: Response, next: NextFunction) {
  const { user } = req.session;

  if (!user.onboarded) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "User is not onboarded",
      data: null,
      error: {
        message: "User is not onboarded",
      },
      success: false,
    });
  }

  if (!user.is_email_verify) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Email is not verified",
      data: null,
      error: {
        message: "Email is not verified. Please verify your email to continue.",
      },
      success: false,
    });
  }

  next();
}
