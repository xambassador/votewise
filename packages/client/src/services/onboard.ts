import type {
  GetAllTopicsResponse,
  GetUserOnboardSessionResponse,
  GetUserOnboardStatusResponse,
  OnboardUserResponse
} from "@votewise/api";
import type { TOnboard } from "@votewise/schemas/onboard";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { topics, user } from "@votewise/constant/routes";

type OnboardOptions = {
  client: Client | ServerClient;
};

export class Onboard {
  private readonly client: Client | ServerClient;

  constructor(opts: OnboardOptions) {
    this.client = opts.client;
  }

  public async isOnboarded() {
    const path = user.runtime.onboard.getStatus("");
    const res = await this.client.get<GetUserOnboardStatusResponse>(path);
    return res;
  }

  public async getOnboardSession() {
    const path = user.runtime.onboard.getOnboardSession("");
    const res = await this.client.get<GetUserOnboardSessionResponse>(path);
    return res;
  }

  public async onboard(data: TOnboard) {
    const path = user.runtime.onboard.update("");
    const res = await this.client.patch<OnboardUserResponse, TOnboard>(path, data);
    return res;
  }

  public async getTopics() {
    const path = topics.runtime.all("");
    const res = await this.client.get<GetAllTopicsResponse>(path);
    return res;
  }
}

export type { GetAllTopicsResponse, GetUserOnboardStatusResponse, OnboardUserResponse };
