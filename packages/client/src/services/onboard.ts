import type { GetAllTopicsResponse, GetUserOnboardStatusResponse, OnboardUserResponse } from "@votewise/api";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { topics, user } from "@votewise/constant/routes";

type OnboardOptions = {
  client: Client | ServerClient;
};

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

export class Onboard {
  private readonly client: Client | ServerClient;

  constructor(opts: OnboardOptions) {
    this.client = opts.client;
  }

  public async isOnboarded(userId: string) {
    const path = user.runtime.onboard.getStatus("", userId);
    const res = await this.client.get<GetUserOnboardStatusResponse>(path);
    return res;
  }

  public async onboard(userId: string, data: OnboardBody) {
    const path = user.runtime.onboard.update("", userId);
    const res = await this.client.patch<OnboardUserResponse, OnboardBody>(path, data);
    return res;
  }

  public async getTopics() {
    const path = topics.runtime.all("");
    const res = await this.client.get<GetAllTopicsResponse>(path);
    return res;
  }
}

export type { GetAllTopicsResponse, GetUserOnboardStatusResponse, OnboardUserResponse };
