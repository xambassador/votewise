import type { ChallengeFactorResponse, EnrollMFAResponse, UnEnrollMFAResponse, VerifyMFAResponse } from "@votewise/api";
import type { TDisableMFA, TVerifyChallenge } from "@votewise/schemas/auth";
import type { BaseOptions, TClient } from "../utils";

import { auth } from "@votewise/constant/routes";

export class MFA {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
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

  public async disable(factorId: string, data: TDisableMFA) {
    const res = await this.client.deleteWithBody<UnEnrollMFAResponse, TDisableMFA>(
      auth.runtime.factors.disableFactor("", factorId),
      data
    );
    return res;
  }
}

export type { EnrollMFAResponse, ChallengeFactorResponse, VerifyMFAResponse, UnEnrollMFAResponse };
