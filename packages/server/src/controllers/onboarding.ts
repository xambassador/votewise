/**
 * @file: onboarding.ts
 * @description: Onboarding controller
 */
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import httpStatusCodes, { StatusCodes } from "http-status-codes";

import type { OnboardingPayload } from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import OnboardingService from "@/src/services/onboarding";
import {
  UNAUTHORIZED_MSG,
  UNAUTHORIZED_RESPONSE,
  USERNAME_ALREADY_TAKEN_MSG,
  USER_ALREADY_ONBOARDED_MSG,
  USER_ONBOARDED_SUCCESSFULLY_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
} from "@/src/utils";

// TODO: Remove all hardcoded messages to lib/constants
export const onboardUser = async (req: Request, res: Response, next: NextFunction) => {
  const { params } = req;
  const payload = req.body as OnboardingPayload;
  const { user } = req.session;

  // Make sure the user is authorized and have enough permissions to onboard.
  if (Number(params.userId) !== user.id) {
    return next(
      createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG, {
        reason: UNAUTHORIZED_MSG,
      })
    );
  }

  // If user already onboarded, return
  if (user.onboarded) {
    return next(
      createError(StatusCodes.BAD_REQUEST, USER_ALREADY_ONBOARDED_MSG, {
        reason: USER_ALREADY_ONBOARDED_MSG,
      })
    );
  }

  const isValidPayload = OnboardingService.validateOnboardingPayload(payload);

  // Validating payload
  if (!isValidPayload.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: isValidPayload.message,
      })
    );
  }

  // Onboarding the user
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
      createError(StatusCodes.INTERNAL_SERVER_ERROR, "Error while onboarding user", {
        reason: errorReason,
      })
    );
  }
};

export const onboardingStatus = async (req: Request, res: Response) => {
  const { params } = req;
  const { user } = req.session;
  if (user.id !== Number(params.userId)) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
  }
  const { onboarded } = user;
  return res
    .status(httpStatusCodes.OK)
    .json(new JSONResponse("Details fetched successfully", { onboarded }, null, true));
};
