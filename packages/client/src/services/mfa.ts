import type { ChallengeFactorResponse, EnrollMFAResponse, VerifyMFAResponse } from "@votewise/api";
import type { TVerifyChallenge } from "@votewise/schemas/auth";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { auth } from "@votewise/constant/routes";

type MFAOptions = { client: Client | ServerClient };

export class MFA {
  private readonly client: Client | ServerClient;

  constructor(opts: MFAOptions) {
    this.client = opts.client;
  }

  public async enroll() {
    const res = await this.client.post<EnrollMFAResponse, object>(auth.runtime.factors.enroll(""), {});
    return res;
  }

  public async challenge(factorId: string, token?: string) {
    const res = await this.client.post<ChallengeFactorResponse, object>(
      auth.runtime.factors.challengeFactor("", factorId),
      {},
      {
        headers: {
          ...(token ? { Authorization: `Votewise ${token}` } : {})
        }
      }
    );
    return res;
  }

  public async verify(factorId: string, data: TVerifyChallenge) {
    const res = await this.client.post<VerifyMFAResponse, TVerifyChallenge>(
      auth.runtime.factors.verifyFactor("", factorId),
      data
    );
    return res;
  }
}

export type { EnrollMFAResponse, ChallengeFactorResponse, VerifyMFAResponse };
