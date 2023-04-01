/**
 * @file: onboarding.ts
 * @description: Onboarding controller
 */
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type { OnboardingPayload } from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import OnboardingService from "@/src/services/onboarding";
import { getErrorReason } from "@/src/utils";


// TODO: Remove all hardcoded messages to lib/constants
export const onboardUser = async (req: Request, res: Response) => {
  const { params } = req;
  const payload = req.body as OnboardingPayload;
  const { user } = req.session;

  // Make sure the user is authorized and have enough permissions to onboard.
  if (Number(params.userId) !== user.id) {
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

  // If user already onboarded, return
  if (user.onboarded) {
    return res.status(httpStatusCodes.BAD_REQUEST).json(
      new JSONResponse(
        "User already onboarded",
        null,
        {
          message: "User already onboarded",
        },
        false
      )
    );
  }

  const isValidPayload = OnboardingService.validateOnboardingPayload(payload);

  // Validating payload
  if (!isValidPayload.success) {
    return res.status(httpStatusCodes.BAD_REQUEST).json(
      new JSONResponse(
        "Validation failed",
        null,
        {
          message: isValidPayload.message,
        },
        false
      )
    );
  }

  // Onboarding the user
  try {
    const onboardedUser = await OnboardingService.onboardUser(payload, user.id);
    return res.status(httpStatusCodes.OK).json(
      new JSONResponse(
        "User onboarded successfully",
        {
          user: onboardedUser,
        },
        null,
        true
      )
    );
  } catch (err) {
    const errorReason = getErrorReason(err) || "Error while onboarding user";
    if (errorReason === "Username already taken") {
      return res.status(httpStatusCodes.BAD_REQUEST).json(
        new JSONResponse(
          "Username already taken",
          null,
          {
            message: "Username already taken",
          },
          false
        )
      );
    }
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        "Error while onboarding user",
        null,
        {
          message: errorReason,
        },
        false
      )
    );
  }
};

export const onboardingStatus = async (req: Request, res: Response) => {
  const { params } = req;
  const { user } = req.session;
  if (user.id !== Number(params.userId)) {
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
  const { onboarded } = user;
  return res
    .status(httpStatusCodes.OK)
    .json(new JSONResponse("Details fetched successfully", { onboarded }, null, true));
};
