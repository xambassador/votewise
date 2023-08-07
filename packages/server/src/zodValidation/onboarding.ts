import { z } from "zod";

import type { OnboardingPayload } from "@votewise/types";

import { generateErrorMessage } from "./generateErrorMessage";

const onboardingPayloadSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(3)
    .max(20),
  name: z.string({
    required_error: "Name is required",
  }),
  about: z
    .string({
      required_error: "About is required",
    })
    .min(10, {
      message: "About should be at least 10 characters long",
    }),
  location: z.string({
    required_error: "Location is required",
  }),
});

export const validateOnboardingPayload = (payload: OnboardingPayload) => {
  const isValid = onboardingPayloadSchema.safeParse(payload);
  if (!isValid.success) {
    const message = generateErrorMessage(isValid.error.issues);
    return {
      success: false,
      message,
    };
  }

  return {
    success: true,
    message: null,
  };
};
