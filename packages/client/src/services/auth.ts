import type {
  ChallengeFactorResponse,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  GetVerificationSessionResponse,
  ResetPasswordResponse,
  SigninResponse,
  SignupResponse,
  VerifyEmailResponse,
  VerifyMFAResponse
} from "@votewise/api";
import type {
  TChangePassword,
  TRegister,
  TResetPassword,
  TResetPasswordQuery,
  TSignin,
  TVerifyEmail
} from "@votewise/schemas/auth";
import type { AccessTokenPayload } from "@votewise/types";
import type { BaseOptions, TClient } from "../utils";

import { auth } from "@votewise/constant/routes";
import { Debugger } from "@votewise/debug";

import { COOKIE_KEYS, jwt } from "../utils";

const debug = new Debugger("auth");
debug.enable();

if (typeof window !== "undefined") {
  throw new Error(
    "The `Auth` service is not yet supported in the browser environment. Please use it in a server context."
  );
}

export class Auth {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
    this.client = opts.client;
  }

  public async signin(data: TSignin) {
    const res = await this.client.post<SigninResponse, TSignin>(auth.runtime.signin(""), data);
    return res;
  }

  public async signup(data: TRegister) {
    const res = await this.client.post<SignupResponse, TRegister>(auth.runtime.register(""), data);
    return res;
  }

  public async verifyEmail(data: TVerifyEmail) {
    const res = await this.client.patch<VerifyEmailResponse, TVerifyEmail>(auth.runtime.verify(""), data);
    return res;
  }

  public async forgotPassword(email: string) {
    const res = await this.client.post<ForgotPasswordResponse, { email: string }>(auth.runtime.forgotPassword(""), {
      email
    });
    return res;
  }

  public async resetPassword(data: TResetPassword & TResetPasswordQuery) {
    const url = auth.runtime.resetPassword("") + `?token=${data.token}`;
    const res = await this.client.patch<ResetPasswordResponse, TResetPassword>(url, { password: data.password });
    return res;
  }

  public async getVerificationSession(email: string) {
    const res = await this.client.get<GetVerificationSessionResponse>(auth.runtime.emailVerificationSession("", email));
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

  public async signout() {
    const storage = this.client.getStorage();
    storage?.remove(COOKIE_KEYS.accessToken);
    storage?.remove(COOKIE_KEYS.refreshToken);
    storage?.remove(COOKIE_KEYS.user);
    const res = await this.client.delete(auth.runtime.logout(""));
    return res;
  }

  public async changePassword(data: TChangePassword) {
    const res = await this.client.patch<ChangePasswordResponse, TChangePassword>(auth.runtime.changePassword(""), data);
    return res;
  }
}

export type {
  ChallengeFactorResponse,
  ForgotPasswordResponse,
  GetVerificationSessionResponse,
  ResetPasswordResponse,
  SigninResponse,
  SignupResponse,
  VerifyEmailResponse,
  VerifyMFAResponse
};
