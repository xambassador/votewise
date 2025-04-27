import type {
  AccessTokenPayload,
  ChallengeFactorResponse,
  SigninResponse,
  SignupResponse,
  VerificationSessionResponse,
  VerifyEmailResponse,
  VerifyResponse
} from "@votewise/types";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { auth } from "@votewise/constant/routes";
import { Debugger } from "@votewise/debug";

import { COOKIE_KEYS, jwt } from "../utils";

type AuthOptions = {
  client: Client | ServerClient;
};

type VerifyEmailBody = {
  email: string;
  verification_code: string;
  otp: string;
};

type VerifyBody = {
  challenge_id: string;
  code: string;
};

const debug = new Debugger("auth");
debug.enable();

export class Auth {
  private readonly client: Client | ServerClient;

  constructor(opts: AuthOptions) {
    this.client = opts.client;
  }

  public async signin(data: { username: string; password: string }) {
    const res = await this.client.post<SigninResponse, { email: string; password: string }>(auth.runtime.signin(""), {
      email: data.username,
      password: data.password
    });
    return res;
  }

  public async signup(data: { email: string; password: string }) {
    const res = await this.client.post<SignupResponse, { email: string; password: string }>(auth.runtime.register(""), {
      email: data.email,
      password: data.password
    });
    return res;
  }

  public async verifyEmail(data: { otp: string; email: string; verificationCode: string }) {
    const res = await this.client.patch<VerifyEmailResponse, VerifyEmailBody>(auth.runtime.verify(""), {
      email: data.email,
      verification_code: data.verificationCode,
      otp: data.otp
    });
    return res;
  }

  public async challengeFactor(factorId: string, token?: string) {
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

  public async verifyFactor(data: { code: string; factorId: string; challengeId: string }) {
    const res = await this.client.post<VerifyResponse, VerifyBody>(
      auth.runtime.factors.verifyFactor("", data.factorId),
      {
        challenge_id: data.challengeId,
        code: data.code
      }
    );
    return res;
  }

  public async forgotPassword(email: string) {
    const res = await this.client.post<{ message: string }, { email: string }>(auth.runtime.forgotPassword(""), {
      email
    });
    return res;
  }

  public async resetPassword(data: { password: string; token: string }) {
    const url = auth.runtime.resetPassword("") + `?token=${data.token}`;
    const res = await this.client.patch<{ message: string }, { password: string }>(url, { password: data.password });
    return res;
  }

  public async getVerificationSession(email: string) {
    const res = await this.client.get<VerificationSessionResponse>(auth.runtime.emailVerificationSession("", email));
    return res;
  }

  /**
   * Get user from the auth cookies.
   * @returns {AccessTokenPayload | null} Returns the user if it exists.
   */
  public getUser(): AccessTokenPayload | null {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    if (!accessToken) return null;
    const result = jwt.verifyAccessToken(accessToken);
    if (!result.success) return null;
    return result.data;
  }

  /**
   * Check if the user is authorized.
   * @returns {Promise<{ user: AccessTokenPayload; accessToken: string } | null} Returns the user and the access token if the user is authorized.
   */
  public async isAuthorized(): Promise<{ user: AccessTokenPayload; accessToken: string } | null> {
    const user = this.getUser();
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    if (!user || !accessToken) return null;
    return { user, accessToken };
  }
}
