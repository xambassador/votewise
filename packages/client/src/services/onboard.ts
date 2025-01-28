import type { Client } from "../client";
import type { Client as ServerClient } from "../server";
import type { TFetchResult } from "../types";

import { COOKIE_KEYS } from "../utils";

type OnboardOptions = {
  client: Client | ServerClient;
};

type GetOnboardedStatusResponse = { is_onboarded: boolean };
type OnboardResponse = { is_onboarded: boolean };
type OnboardBody = {
  user_name: string;
  first_name: string;
  last_name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  about: string;
  avatar_url: string;
  cover_url: string;
  location: string;
  facebook_url?: string | undefined;
  instagram_url?: string | undefined;
  twitter_url?: string | undefined;
};
export class Onboard {
  private readonly client: Client | ServerClient;

  constructor(opts: OnboardOptions) {
    this.client = opts.client;
  }

  public async isOnboarded(): Promise<TFetchResult<GetOnboardedStatusResponse>> {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    if (!accessToken) {
      return {
        success: false,
        error: "Invalid request",
        status: 401,
        errorData: { message: "Invalid request", status_code: 401, name: "UnauthorizedError" }
      };
    }
    const res = await this.client.get<GetOnboardedStatusResponse>("/v1/user/onboard", {
      headers: { Authorization: `Votewise ${accessToken}` }
    });
    return res;
  }

  public async onboard(data: OnboardBody): Promise<TFetchResult<OnboardResponse>> {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    if (!accessToken) {
      return {
        success: false,
        error: "Invalid request",
        status: 401,
        errorData: { message: "Invalid request", status_code: 401, name: "UnauthorizedError" }
      };
    }
    const res = await this.client.patch<OnboardResponse, OnboardBody>("/v1/user/onboard", data, {
      headers: { Authorization: `Votewise ${accessToken}` }
    });
    return res;
  }
}
