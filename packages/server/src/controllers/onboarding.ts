import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

import type { OnboardingPayload } from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import OnboardingService from "@/src/services/onboarding";
import {
  SOMETHING_WENT_WRONG_MSG,
  USERNAME_ALREADY_TAKEN_MSG,
  USER_ALREADY_ONBOARDED_MSG,
  USER_ONBOARDED_SUCCESSFULLY_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
} from "@/src/utils";

export const onboardUser = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as OnboardingPayload;
  const { user } = req.session;

  if (user.onboarded) return next(createError(StatusCodes.BAD_REQUEST, USER_ALREADY_ONBOARDED_MSG));

  const isValidPayload = OnboardingService.validateOnboardingPayload(payload);

  if (!isValidPayload.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: isValidPayload.message,
      })
    );
  }

  try {
    const onboardedUser = await OnboardingService.onboardUser(payload, user.id);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        USER_ONBOARDED_SUCCESSFULLY_MSG,
        {
          user: onboardedUser,
        },
        null,
        true
      )
    );
  } catch (err) {
    const errorReason = getErrorReason(err);
    if (errorReason === USERNAME_ALREADY_TAKEN_MSG) {
      return next(createError(StatusCodes.BAD_REQUEST, USERNAME_ALREADY_TAKEN_MSG));
    }
    return next(
      createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, {
        reason: errorReason,
      })
    );
  }
};

export const onboardingStatus = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { onboarded } = user;

  return res
    .status(StatusCodes.OK)
    .json(new JSONResponse("Details fetched successfully", { onboarded }, null, true));
};
