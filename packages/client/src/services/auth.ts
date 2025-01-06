import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { COOKIE_KEYS } from "../utils";

type AuthOptions = {
  client: Client | ServerClient;
};

type SigninResponse = {
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

export class Auth {
  private readonly client: Client | ServerClient;

  constructor(opts: AuthOptions) {
    this.client = opts.client;
  }

  public async signin(data: { username: string; password: string }) {
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
}
