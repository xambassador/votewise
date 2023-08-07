import { ERROR_WHILE_ONBOARDING_USER_MSG, USERNAME_ALREADY_TAKEN_MSG } from "@votewise/lib/constants";
import { prisma } from "@votewise/prisma";
import type { OnboardingPayload } from "@votewise/types";

import UserService from "@/src/services/user";
import { getErrorReason } from "@/src/utils";
import { validateOnboardingPayload } from "@/src/zodValidation";

class OnboardingService {
  validateOnboardingPayload(payload: OnboardingPayload) {
    return validateOnboardingPayload(payload);
  }

  async onboardUser(payload: OnboardingPayload, userId: number) {
    try {
      const isUsernameAlreadyTaken = await UserService.checkIfUsernameExists(payload.username);
      if (isUsernameAlreadyTaken) {
        throw new Error(USERNAME_ALREADY_TAKEN_MSG);
      }
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
      const reason = getErrorReason(err) || ERROR_WHILE_ONBOARDING_USER_MSG;
      throw new Error(reason);
    }
  }
}

export default new OnboardingService();
