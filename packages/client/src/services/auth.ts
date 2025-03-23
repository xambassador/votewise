import type { AccessTokenPayload } from "@votewise/jwt";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";
import type { TFetchResult } from "../types";

import { Debugger } from "@votewise/debug";

import { COOKIE_KEYS, jwt } from "../utils";

type AuthOptions = {
  client: Client | ServerClient;
};

export type { AccessTokenPayload };

export type SigninResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: string;
    email_confirmed_at: string;
    email_confirmation_sent_at: string;
    last_sign_in_at: string;
    is_onboarded: boolean;
    user_aal_level: "aal1" | "aal2";
    factors: {
      id: string;
      type: string;
      status: string;
      name: string;
    }[];
  };
};

export type TSignupResponse = {
  user_id: string;
  verification_code: string;
  expires_in: number;
};

export type VerifyEmailResponse = {
  user_id: string;
  email: string;
  is_email_verify: boolean;
};

type VerifyEmailBody = {
  email: string;
  verification_code: string;
  otp: string;
};

type ChallengeFactorResponse = { id: string; expires_at: string; type: string };

export type VerifyResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
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

  public async signin(data: { username: string; password: string }): Promise<TFetchResult<SigninResponse>> {
    const res = await this.client.post<SigninResponse, { email: string; password: string }>("/v1/auth/signin", {
      email: data.username,
      password: data.password
    });
    return res;
  }

  public async signup(data: { email: string; password: string }): Promise<TFetchResult<TSignupResponse>> {
    const res = await this.client.post<TSignupResponse, { email: string; password: string }>("/v1/auth/register", {
      email: data.email,
      password: data.password
    });
    return res;
  }

  public async verifyEmail(data: {
    otp: string;
    email: string;
    verificationCode: string;
  }): Promise<TFetchResult<VerifyEmailResponse>> {
    const res = await this.client.patch<VerifyEmailResponse, VerifyEmailBody>("/v1/auth/verify", {
      email: data.email,
      verification_code: data.verificationCode,
      otp: data.otp
    });
    return res;
  }

  public async challengeFactor(factorId: string, token?: string): Promise<TFetchResult<ChallengeFactorResponse>> {
    const res = await this.client.post<ChallengeFactorResponse, object>(
      `/v1/auth/factors/${factorId}/challenge`,
      {},
      {
        headers: {
          ...(token ? { Authorization: `Votewise ${token}` } : {})
        }
      }
    );
    return res;
  }

  public async verifyFactor(data: {
    code: string;
    factorId: string;
    challengeId: string;
  }): Promise<TFetchResult<VerifyResponse>> {
    const res = await this.client.post<VerifyResponse, VerifyBody>(`/v1/auth/factors/${data.factorId}/verify`, {
      challenge_id: data.challengeId,
      code: data.code
    });
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
