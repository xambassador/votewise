/**
 * @file: index.ts
 * @description: Onboarding service
 */
import { prisma } from "@votewise/prisma";
import type { OnboardingPayload } from "@votewise/types";

import UserService from "@/src/services/user";
import { validateOnboardingPayload } from "@/src/zodValidation";

class OnboardingService {
  validateOnboardingPayload(payload: OnboardingPayload) {
    return validateOnboardingPayload(payload);
  }

  async onboardUser(payload: OnboardingPayload, userId: number) {
    const isUsernameAlreadyTaken = await UserService.checkIfUsernameExists(payload.username);
    if (isUsernameAlreadyTaken) {
      throw new Error("Username already taken");
    }
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...payload,
          onboarded: true,
        },
        select: {
          id: true,
          username: true,
          name: true,
          profile_image: true,
          cover_image: true,
          location: true,
          gender: true,
          twitter: true,
          email: true,
          facebook: true,
          about: true,
          onboarded: true,
          last_login: true,
          is_email_verify: true,
          updated_at: true,
        },
      });
      return user;
    } catch (err) {
      throw new Error("Error while onboarding user.");
    }
  }
}

export default new OnboardingService();
