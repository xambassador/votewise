import type { Client } from "../client";
import type { Client as ServerClient } from "../server";
import type { TFetchResult } from "../types";

type OnboardOptions = {
  client: Client | ServerClient;
};

type GetOnboardedStatusResponse = { is_onboarded: boolean };

export class Onboard {
  private readonly client: Client | ServerClient;

  constructor(opts: OnboardOptions) {
    this.client = opts.client;
  }

  public async isOnboarded(token: string): Promise<TFetchResult<GetOnboardedStatusResponse>> {
    const res = await this.client.get<GetOnboardedStatusResponse>("/v1/user/onboard", {
      headers: { Authorization: `Votewise ${token}` }
    });
    return res;
  }
}
