import type { AppContext } from "@/context";

import { Minute } from "@votewise/times";

type SessionManagerOptions = {
  cache: AppContext["cache"];
  cryptoService: AppContext["cryptoService"];
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
};

type Create = {
  userId: string;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  ip: string;
  email: string;
  username: string;
  userAgent?: string;
};
type SessionData =
  | {
      ip: string;
      user_agent?: string;
      is_2fa_enabled: "true";
      is_2fa_verified: "true" | "false";
      email: string;
      username: string;
    }
  | { ip: string; user_agent?: string; is_2fa_enabled: "false"; email: string; username: string };
type SessionFields = "ip" | "user_agent";
type User =
  | { email: string; username: string; is_2fa_enabled: "true"; is_2fa_verified: "true" | "false" }
  | { email: string; username: string; is_2fa_enabled: "false" };

export class SessionManager {
  private readonly ctx: SessionManagerOptions;

  constructor(opts: SessionManagerOptions) {
    this.ctx = opts;
  }

  public getSessionKey(userId: string, sessionId: string) {
    return `session:${userId}:${sessionId}`;
  }

  public async create(opts: Create) {
    const { userAgent, userId, isEmailVerified, ip, is2FAEnabled, username, email } = opts;

    const sessionId = this.ctx.cryptoService.generateUUID();
    const accessTokenData = { user_id: userId, is_email_verified: isEmailVerified, session_id: sessionId };
    const refreshTokenData = { user_id: userId, session_id: sessionId };
    const accessToken = this.ctx.jwtService.signAccessToken(accessTokenData, { expiresIn: "15m" });
    const refreshToken = this.ctx.jwtService.signRefreshToken(refreshTokenData, { expiresIn: "7d" });

    let sessionData: SessionData;
    if (is2FAEnabled) {
      sessionData = { ip, user_agent: userAgent, is_2fa_enabled: "true", is_2fa_verified: "false", username, email };
    } else {
      sessionData = { ip, user_agent: userAgent, is_2fa_enabled: "false", username, email };
    }

    const key = this.getSessionKey(userId, sessionId);

    // Setting expiry for 20 minutes, so client can refresh the token
    await this.ctx.cache.hset(key, sessionData);
    await this.ctx.cache.expire(key, 20 * Minute);

    return { accessToken, refreshToken, sessionId };
  }

  public async delete(userId: string, sessionId: string) {
    const key = this.getSessionKey(userId, sessionId);
    await this.ctx.cache.del(key);
  }

  public async deleteAll(userId: string) {
    const sessionKeyPattern = `session:${userId}:*`;
    const sessionKeys = await this.ctx.cache.keys(sessionKeyPattern);
    await Promise.all(sessionKeys.map((key) => this.ctx.cache.del(key)));
  }

  public async enforceSessionLimit(userId: string) {
    const sessionKeyPattern = `session:${userId}:*`;
    const sessionKeys = await this.ctx.cache.keys(sessionKeyPattern);
    this.ctx.assert.badRequest(sessionKeys.length >= 3, `You have 3 active sessions, please logout from one of them`);
  }

  public async getSession(userId: string, sessionId: string) {
    const key = this.getSessionKey(userId, sessionId);
    return this.ctx.cache.hgetall(key) as unknown as Promise<SessionData>;
  }

  public async getSessions(userId: string) {
    const sessionKeyPattern = `session:${userId}:*`;
    const sessionKeys = await this.ctx.cache.keys(sessionKeyPattern);
    const sessions: ({ id: string } & SessionData)[] = [];
    for (const key of sessionKeys) {
      const sessionId = key.split(":")[2];
      const data = (await this.ctx.cache.hgetall(key)) as unknown as SessionData;
      if (!data || Object.keys(data).length === 0) continue;
      if (data.is_2fa_enabled === "true") {
        sessions.push({
          id: sessionId!,
          ip: data.ip,
          user_agent: data.user_agent,
          is_2fa_enabled: data.is_2fa_enabled,
          is_2fa_verified: data.is_2fa_verified,
          email: data.email,
          username: data.username
        });
      } else {
        sessions.push({
          id: sessionId!,
          ip: data.ip,
          user_agent: data.user_agent,
          is_2fa_enabled: data.is_2fa_enabled,
          email: data.email,
          username: data.username
        });
      }
    }
    return sessions;
  }

  public async getFieldFromSession(key: string, field: SessionFields) {
    return this.ctx.cache.hget(key, field);
  }

  public async storeUserInSession(userId: string, sessionId: string, user: User) {
    const key = this.getSessionKey(userId, sessionId);
    return this.ctx.cache.hset(key, user);
  }

  public async updateSessionData(userId: string, sessionId: string, data: Partial<SessionData>) {
    const key = this.getSessionKey(userId, sessionId);
    const oldData = this.ctx.cache.hgetall(key);
    if (!oldData) return;
    await this.ctx.cache.hset(key, { ...oldData, ...data });
  }
}
