import type { AppContext } from "@/context";

import { z } from "zod";

import { Minute } from "@votewise/times";

type ServiceOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cache: AppContext["cache"];
};

const schema = z.object({
  user_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  about: z.string().nullable(),
  avatar_url: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  location: z.string().nullable(),
  facebook_profile_url: z.string().nullable(),
  instagram_profile_url: z.string().nullable(),
  twitter_profile_url: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  is_onboarded: z.boolean().default(false)
});

type OnboardData = z.infer<typeof schema>;

export class OnboardService {
  private readonly ctx: ServiceOptions;

  constructor(opts: ServiceOptions) {
    this.ctx = opts;
  }

  public async getUserOnboardData(userId: string) {
    const onboardDataFromCache = await this.getOnboardDataFromCache(userId);
    if (onboardDataFromCache) return onboardDataFromCache;
    const _onboardDataFromDb = await this.ctx.userRepository.findById(userId);
    this.ctx.assert.resourceNotFound(!_onboardDataFromDb, "User does not exist");
    const onboardDataFromDb = _onboardDataFromDb!;
    let hasValidFirstStep = false;
    if (onboardDataFromDb.first_name !== "INVALID_FIRST_NAME" && onboardDataFromDb.user_name !== "INVALID_USER_NAME") {
      hasValidFirstStep = true;
    }
    const avatarUrl = onboardDataFromDb.avatar_url;
    const backgroundUrl = onboardDataFromDb.cover_image_url;
    const data: OnboardData = {
      user_name: hasValidFirstStep ? onboardDataFromDb.user_name : "",
      first_name: hasValidFirstStep ? onboardDataFromDb.first_name : "",
      last_name: hasValidFirstStep ? onboardDataFromDb.last_name : "",
      about: onboardDataFromDb.about,
      avatar_url: avatarUrl,
      cover_image_url: backgroundUrl,
      gender: onboardDataFromDb.gender as OnboardData["gender"],
      location: onboardDataFromDb.location,
      topics: [],
      facebook_profile_url: onboardDataFromDb.facebook_profile_url,
      twitter_profile_url: onboardDataFromDb.twitter_profile_url,
      instagram_profile_url: onboardDataFromDb.instagram_profile_url,
      is_onboarded: onboardDataFromDb.is_onboarded
    };
    await this.ctx.cache.setWithExpiry(this.getOnboardKey(userId), JSON.stringify(data), 10 * Minute);
    return data;
  }

  public async updateUserOnboardCache(userId: string, data: Partial<OnboardData>) {
    const onboardData = await this.getOnboardDataFromCache(userId);
    if (!onboardData) return;
    const updatedData = { ...onboardData, ...data };
    const remainingTime = await this.ctx.cache.getRemainingTime(this.getOnboardKey(userId));
    await this.ctx.cache.setWithExpiry(this.getOnboardKey(userId), JSON.stringify(updatedData), remainingTime);
  }

  public async clearUserOnboardCache(userId: string) {
    const key = this.getOnboardKey(userId);
    await this.ctx.cache.del(key);
  }

  private async getOnboardDataFromCache(userId: string) {
    const key = this.getOnboardKey(userId);
    const data = await this.ctx.cache.get(key);
    if (!data) return null;
    try {
      const cachedData = JSON.parse(data);
      const validatedData = schema.parse(cachedData);
      return validatedData;
    } catch (err) {
      await this.ctx.cache.del(key);
      return null;
    }
  }

  private getOnboardKey(userId: string) {
    return `onboard:session:${userId}`;
  }
}
