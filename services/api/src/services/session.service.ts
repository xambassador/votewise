import type { AppContext } from "@/context";

import { Minute } from "@votewise/lib/times";

type SessionManagerOptions = {
  cache: AppContext["cache"];
  cryptoService: AppContext["cryptoService"];
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
};

type Create = {
  userId: string;
  isEmailVerified: boolean;
  ip: string;
  userAgent?: string;
};
type SessionData = { ip: string; user_agent?: string };
type SessionFields = "ip" | "user_agent";
type User = { email: string; username: string };

export class SessionManager {
  private readonly ctx: SessionManagerOptions;

  constructor(opts: SessionManagerOptions) {
    this.ctx = opts;
  }

  public getSessionKey(userId: string, sessionId: string) {
    return `session:${userId}:${sessionId}`;
  }

  public getUserDataKey(userId: string) {
    return `session:data:${userId}`;
  }

  public async create(opts: Create) {
    const { userAgent, userId, isEmailVerified, ip } = opts;
    const sessionId = this.ctx.cryptoService.generateUUID();
    const tokenData = { user_id: userId, is_email_verified: isEmailVerified, session_id: sessionId };
    const refreshTokenData = { user_id: userId, session_id: sessionId };
    const accessToken = this.ctx.jwtService.signAccessToken(tokenData, { expiresIn: "15m" });
    const refreshToken = this.ctx.jwtService.signRefreshToken(refreshTokenData, { expiresIn: "7d" });

    const session: SessionData = { ip, user_agent: userAgent };
    const key = this.getSessionKey(userId, sessionId);

    // Setting expiry for 20 minutes, so client can refresh the token
    await this.ctx.cache.hset(key, session);
    await this.ctx.cache.expire(key, 20 * Minute);

    return { accessToken, refreshToken, sessionId };
  }

  public async delete(userId: string, sessionId: string) {
    const key = this.getSessionKey(userId, sessionId);
    const userKey = this.getUserDataKey(userId);
    await Promise.all([this.ctx.cache.del(key), this.ctx.cache.del(userKey)]);
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
    return this.ctx.cache.hgetall(key) as Promise<SessionData>;
  }

  public async getSessions(userId: string) {
    const sessionKeyPattern = `session:${userId}:*`;
    const sessionKeys = await this.ctx.cache.keys(sessionKeyPattern);
    const sessions: ({ id: string } & SessionData)[] = [];
    for (const key of sessionKeys) {
      const sessionId = key.split(":")[2];
      const data = (await this.ctx.cache.hgetall(key)) as SessionData;
      if (!data || Object.keys(data).length === 0) continue;
      sessions.push({ id: sessionId!, ip: data.ip, user_agent: data.user_agent });
    }
    return sessions;
  }

  public async getFieldFromSession(key: string, field: SessionFields) {
    return this.ctx.cache.hget(key, field);
  }

  public async getUserFromSession(userId: string) {
    const key = this.getUserDataKey(userId);
    const data = await this.ctx.cache.get(key);
    return data ? (JSON.parse(data) as User) : null;
  }

  public async setUserToSession(userId: string, user: User) {
    const key = this.getUserDataKey(userId);
    return this.ctx.cache.set(key, JSON.stringify(user));
  }
}
