import type { Client } from "../client";
import type { Client as ServerClient } from "../server";
import type { TFetchResult } from "../types";

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
  topics?: string[] | undefined;
};
type GetTopicsResponse = { topics: { id: string; name: string }[] };

export class Onboard {
  private readonly client: Client | ServerClient;

  constructor(opts: OnboardOptions) {
    this.client = opts.client;
  }

  public async isOnboarded(userId: string): Promise<TFetchResult<GetOnboardedStatusResponse>> {
    const path = `/v1/users/${userId}/onboard`;
    const res = await this.client.get<GetOnboardedStatusResponse>(path);
    return res;
  }

  public async onboard(userId: string, data: OnboardBody): Promise<TFetchResult<OnboardResponse>> {
    const path = `/v1/users/${userId}/onboard`;
    const res = await this.client.patch<OnboardResponse, OnboardBody>(path, data);
    return res;
  }

  public async getTopics(): Promise<TFetchResult<GetTopicsResponse>> {
    const path = `/v1/topics`;
    const res = await this.client.get<GetTopicsResponse>(path);
    return res;
  }
}
