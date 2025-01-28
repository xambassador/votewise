import type { AccessTokenPayload } from "@votewise/jwt";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";
import type { TFetchResult } from "../types";

import { ERROR_CODES } from "@votewise/constant";
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
  user_id: string;
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

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
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
    const storage = this.client.getStorage();
    if (storage && res.success) {
      const expires = new Date(Date.now() + res.data.expires_in);
      storage.set(COOKIE_KEYS.accessToken, res.data.access_token, { expires });
      storage.set(COOKIE_KEYS.refreshToken, res.data.refresh_token, { expires });
      storage.set(COOKIE_KEYS.user, JSON.stringify(res.data.user), { expires });
      storage.set(COOKIE_KEYS.isOnboarded, res.data.user.is_onboarded ? "true" : "false", { expires });
    }
    return res;
  }

  public async signup(data: { email: string; password: string }): Promise<TFetchResult<TSignupResponse>> {
    const res = await this.client.post<TSignupResponse, { email: string; password: string }>("/v1/auth/register", {
      email: data.email,
      password: data.password
    });
    const storage = this.client.getStorage();
    if (storage && res.success) {
      storage.set(COOKIE_KEYS.userId, res.data.user_id, { expires: new Date(Date.now() + res.data.expires_in) });
      storage.set(COOKIE_KEYS.verificationCode, res.data.verification_code, {
        expires: new Date(Date.now() + res.data.expires_in)
      });
      storage.set(COOKIE_KEYS.email, data.email, { expires: new Date(Date.now() + res.data.expires_in) });
    }
    return res;
  }

  public async verifyEmail(data: { otp: string }): Promise<TFetchResult<VerifyEmailResponse>> {
    const storage = this.client.getStorage();
    const email = storage?.get(COOKIE_KEYS.email);
    const userId = storage?.get(COOKIE_KEYS.userId);
    const verificationCode = storage?.get(COOKIE_KEYS.verificationCode);
    if (!email || !userId || !verificationCode) {
      storage?.remove(COOKIE_KEYS.email);
      storage?.remove(COOKIE_KEYS.userId);
      storage?.remove(COOKIE_KEYS.verificationCode);
      return {
        success: false,
        error: "Invalid request",
        status: 400,
        errorData: {
          message: "Invalid request",
          name: "InvalidRequestError",
          status_code: 400
        }
      };
    }

    const res = await this.client.patch<VerifyEmailResponse, VerifyEmailBody>("/v1/auth/verify", {
      email,
      verification_code: verificationCode,
      otp: data.otp,
      user_id: userId
    });

    if (res.success) {
      storage?.remove(COOKIE_KEYS.email);
      storage?.remove(COOKIE_KEYS.userId);
      storage?.remove(COOKIE_KEYS.verificationCode);
    }

    return res;
  }

  public async challengeFactor(factorId: string, token: string): Promise<TFetchResult<ChallengeFactorResponse>> {
    const res = await this.client.post<ChallengeFactorResponse, object>(
      `/v1/auth/factors/${factorId}/challenge`,
      {},
      { headers: { Authorization: `Votewise ${token}` } }
    );
    const storage = this.client.getStorage();
    if (!res.success) {
      // Let's logout the user for now.
      storage?.remove(COOKIE_KEYS.accessToken);
      storage?.remove(COOKIE_KEYS.refreshToken);
      storage?.remove(COOKIE_KEYS.user);
      storage?.remove(COOKIE_KEYS.isOnboarded);
    }

    if (res.success) {
      storage?.set(COOKIE_KEYS.factorId, factorId);
      storage?.set(COOKIE_KEYS.challengeId, res.data.id);
    }

    return res;
  }

  public async verifyFactor(code: string): Promise<TFetchResult<VerifyResponse>> {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    const challengeId = storage?.get(COOKIE_KEYS.challengeId);
    const factorId = storage?.get(COOKIE_KEYS.factorId);
    if (!challengeId || !factorId || !accessToken) {
      storage?.remove(COOKIE_KEYS.accessToken);
      storage?.remove(COOKIE_KEYS.refreshToken);
      storage?.remove(COOKIE_KEYS.user);
      storage?.remove(COOKIE_KEYS.isOnboarded);
      return {
        success: false,
        status: 400,
        error: "Invalid request",
        errorData: {
          message: "Invalid request",
          name: "InvalidRequestError",
          status_code: 400
        }
      };
    }

    const res = await this.client.post<VerifyResponse, VerifyBody>(
      `/v1/auth/factors/${factorId}/verify`,
      {
        challenge_id: challengeId,
        code
      },
      { headers: { Authorization: `Votewise ${accessToken}` } }
    );

    if (!res.success && res.errorData.error_code === ERROR_CODES["2FA"].CHALLENGE_EXPIRED) {
      storage?.remove(COOKIE_KEYS.challengeId);
      storage?.remove(COOKIE_KEYS.factorId);
      storage?.remove(COOKIE_KEYS.accessToken);
      storage?.remove(COOKIE_KEYS.refreshToken);
      storage?.remove(COOKIE_KEYS.user);
      storage?.remove(COOKIE_KEYS.isOnboarded);
      return {
        success: false,
        error: "Challenge expired",
        errorData: {
          message: "Challenge expired. Try again.",
          name: res.errorData.name,
          status_code: res.errorData.status_code,
          error_code: res.errorData.error_code
        },
        status: res.errorData.status_code
      };
    }

    if (res.success) {
      const expires = new Date(Date.now() + res.data.expires_in);
      storage?.remove(COOKIE_KEYS.challengeId);
      storage?.remove(COOKIE_KEYS.factorId);
      storage?.set(COOKIE_KEYS.accessToken, res.data.access_token, { expires });
      storage?.set(COOKIE_KEYS.refreshToken, res.data.refresh_token, { expires });
    }
    return res;
  }

  public async refresh(): Promise<TFetchResult<RefreshResponse>> {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    const refreshToken = storage?.get(COOKIE_KEYS.refreshToken);
    if (!accessToken || !refreshToken) {
      return {
        success: false,
        error: "Invalid request",
        status: 400,
        errorData: { message: "Invalid request", name: "InvalidRequestError", status_code: 400 }
      };
    }

    const res = await this.client.post<RefreshResponse, { access_token: string; refresh_token: string }>(
      "/v1/auth/refresh",
      {
        access_token: accessToken,
        refresh_token: refreshToken
      }
    );
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
   * Check if the user is authorized. This method will also refresh the token if it's expired.
   * @returns {Promise<{ user: AccessTokenPayload; accessToken: string } | null} Returns the user and the access token if the user is authorized.
   */
  public async isAuthorized(): Promise<{ user: AccessTokenPayload; accessToken: string } | null> {
    const storage = this.client.getStorage();
    const accessToken = storage?.get(COOKIE_KEYS.accessToken);
    if (!accessToken) return null;
    const result = jwt.verifyAccessToken(accessToken);
    if (!result.success) {
      if (result.error === "TOKEN_EXPIRED") {
        debug.warn("Token expired. Refreshing token...");
        const res = await this.refresh();
        if (!res.success) {
          debug.warn("Token refresh failed. Logging out...");
          storage?.remove(COOKIE_KEYS.accessToken);
          storage?.remove(COOKIE_KEYS.refreshToken);
          storage?.remove(COOKIE_KEYS.user);
          storage?.remove(COOKIE_KEYS.isOnboarded);
          return null;
        }
        const newResult = jwt.verifyAccessToken(res.data.access_token);
        if (!newResult.success) return null;
        storage?.set(COOKIE_KEYS.accessToken, res.data.access_token, {
          expires: new Date(Date.now() + res.data.expires_in)
        });
        storage?.set(COOKIE_KEYS.refreshToken, res.data.refresh_token, {
          expires: new Date(Date.now() + res.data.expires_in)
        });
        debug.info("Token refreshed successfully.");
        return { user: newResult.data, accessToken: res.data.access_token };
      }

      return null;
    }

    return { user: result.data, accessToken };
  }
}
