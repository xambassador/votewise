import type { OnboardingPayload } from "@votewise/types";
import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import ServerError from "@/src/classes/ServerError";
import Success from "@/src/classes/Success";
import ValidationError from "@/src/classes/ValidationError";

import OnboardingService from "@/src/services/onboarding";

import { USER_ALREADY_ONBOARDED_MSG, USER_ONBOARDED_SUCCESSFULLY_MSG } from "@/src/utils";

/* ----------------------------------------------------------------------------------------------- */

export const onboardUser = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as OnboardingPayload;
  const { user } = req.session;

  if (user.onboarded) return next(new ServerError(StatusCodes.BAD_REQUEST, USER_ALREADY_ONBOARDED_MSG));

  const isValidPayload = OnboardingService.validateOnboardingPayload(payload);

  if (!isValidPayload.success) {
    return next(new ValidationError(isValidPayload.message));
  }

  try {
    const onboardedUser = await OnboardingService.onboardUser(payload, user.id);
    const response = new Success(USER_ONBOARDED_SUCCESSFULLY_MSG, {
      user: onboardedUser,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const onboardingStatus = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { onboarded } = user;
  const response = new Success("Details fetched successfully", { onboarded });
  return res.status(StatusCodes.OK).json(response);
};
