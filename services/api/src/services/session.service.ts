import type { AppContext } from "@/context";

import { Minute } from "@votewise/times";

type SessionManagerOptions = {
  cache: AppContext["cache"];
  cryptoService: AppContext["services"]["crypto"];
  jwtService: AppContext["services"]["jwt"];
  assert: AppContext["assert"];
  sessionRepository: AppContext["repositories"]["session"];
  accessTokenExpiration: number;
};
type CreateOptions = {
  subject: string;
  email: string;
  role: string;
  appMetaData?: Record<string, unknown>;
  userMetaData?: Record<string, unknown>;
  amr: { method: string; timestamp: number }[];
  aal: "aal1" | "aal2";
  sessionId?: string; // If need to create a session for existing session ID
  user_aal_level: "aal1" | "aal2";
};

export class SessionManager {
  private readonly ctx: SessionManagerOptions;

  constructor(opts: SessionManagerOptions) {
    this.ctx = opts;
  }

  public getSessionKey(sessionId: string) {
    return `session:${sessionId}`;
  }

  /**
   * Create a new session in-form of access token and refresh token.
   *
   * @param opts - Session creation options
   */
  public create(opts: CreateOptions) {
    const {
      subject,
      role,
      email,
      aal,
      amr,
      appMetaData = {},
      userMetaData = {},
      sessionId: existingSessionId,
      user_aal_level
    } = opts;
    const sessionId = existingSessionId || this.ctx.cryptoService.generateUUID();
    const refreshToken = this.ctx.cryptoService.generateUUID().replace(/-/g, "");
    const expiresIn = this.ctx.accessTokenExpiration;
    const expiresAt = Date.now() + expiresIn;
    const accessToken = this.ctx.jwtService.signAccessToken(
      {
        sub: subject,
        role,
        email,
        aal,
        amr,
        app_metadata: appMetaData,
        user_metadata: userMetaData,
        session_id: sessionId,
        user_aal_level
      },
      { expiresIn }
    );
    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresInMs: expiresIn,
      expiresAt
    };
  }

  /**
   * Save the session into the cache and database
   *
   * @param {string} sessionId - Session ID
   * @param {TSession & { userId: string }} session - Session object
   */
  public async save(sessionId: string, session: InMemorySession & { userId: string }) {
    const key = this.getSessionKey(sessionId);
    await this.ctx.cache.setWithExpiry(
      key,
      JSON.stringify({ ip: session.ip, userAgent: session.userAgent, aal: session.aal }),
      20 * Minute
    );
    await this.ctx.sessionRepository.create({
      id: sessionId,
      aal: session.aal,
      ip: session.ip,
      userAgent: session.userAgent,
      userId: session.userId
    });
  }

  /**
   * Save the session into memory
   *
   * @param {string} sessionId - Session ID
   * @param {TSession & { userId: string }} session - Session object
   */
  public async saveSessionToCache(sessionId: string, session: InMemorySession & { userId: string }) {
    const key = this.getSessionKey(sessionId);
    await this.ctx.cache.setWithExpiry(
      key,
      JSON.stringify({ ip: session.ip, userAgent: session.userAgent, aal: session.aal }),
      20 * Minute
    );
  }

  /**
   * Get the session from the cache if found else load from database and save in cache
   *
   * @param {string} sessionId - Session ID
   */
  public async get(sessionId: string) {
    const key = this.getSessionKey(sessionId);
    const session = await this.ctx.cache.get(key);
    if (session) return JSON.parse(session) as InMemorySession;
    const sessionData = await this.ctx.sessionRepository.find(sessionId);
    if (!sessionData) return null;
    const data = {
      ip: sessionData.ip,
      userAgent: sessionData.user_agent,
      aal: sessionData.aal as "aal1" | "aal2",
      userId: sessionData.user_id
    };
    await this.saveSessionToCache(sessionId, data);
    return data;
  }

  /**
   * Delete the session from the cache and database
   *
   * @param {string} sessionId - Session ID
   */
  public async delete(sessionId: string) {
    const key = this.getSessionKey(sessionId);
    await this.ctx.cache.del(key);
    await this.ctx.sessionRepository.delete(sessionId);
  }

  /**
   * Update the session in the cache and database
   *
   * @param sessionId - Session ID
   * @param data - Data to update
   */
  public async update(
    sessionId: string,
    data: Partial<{ aal: "aal1" | "aal2"; userAgent: string; ip: string; factorId: string; userId: string }>
  ) {
    const key = this.getSessionKey(sessionId);
    const session = await this.ctx.cache.get(key);
    const sessionFromDatabase = await this.ctx.sessionRepository.find(sessionId);
    if (!session) return null;
    if (!sessionFromDatabase) return null;
    const sessionData = JSON.parse(session) as InMemorySession;
    const updatedSession = { ...sessionData, ...data };
    await this.ctx.cache.set(key, JSON.stringify(updatedSession));
    await this.ctx.sessionRepository.update(sessionId, {
      aal: data.aal,
      userAgent: data.userAgent,
      ip: data.ip,
      factorId: data.factorId,
      userId: data.userId
    });
    return updatedSession;
  }

  /**
   * Create a new forgot password session
   *
   * @param {string} userId - User ID
   */
  public async createForgotPasswordSession(data: { userId: string; email: string }) {
    const sessionId = this.ctx.cryptoService.generateRandomString();
    const expiresIn = 30 * Minute;
    const sessionData = { userId: data.userId, email: data.email };
    const key = `forgot-password:${sessionId}`;
    await this.ctx.cache.setWithExpiry(key, JSON.stringify(sessionData), expiresIn);
    return { sessionId, expiresIn };
  }

  /**
   * Get the forgot password session
   *
   * @param {string} sessionId - Session ID
   */
  public async getForgotPasswordSession(sessionId: string) {
    const key = `forgot-password:${sessionId}`;
    const session = await this.ctx.cache.get(key);
    if (!session) return null;
    try {
      const sessionData = JSON.parse(session) as { userId: string; email: string };
      return sessionData;
    } catch (err) {
      return this.ctx.assert.badRequest(true, "Invalid session data");
    }
  }

  /**
   * Delete the forgot password session
   *
   * @param {string} sessionId - Session ID
   */
  public async deleteForgotPasswordSession(sessionId: string) {
    const key = `forgot-password:${sessionId}`;
    const session = await this.ctx.cache.get(key);
    if (!session) return null;
    await this.ctx.cache.del(key);
    return true;
  }

  /**
   * Delete all sessions for a user
   *
   * @param {string} userId - User ID
   */
  public async clearUserSessions(userId: string) {
    const sessions = await this.ctx.sessionRepository.findByUserId(userId);
    const sessionIds = sessions.map((session) => session.id);
    const keys = sessionIds.map((sessionId) => this.getSessionKey(sessionId));
    await Promise.all(keys.map((key) => this.ctx.cache.del(key)));
    await this.ctx.sessionRepository.clearByUserId(userId);
  }

  /**
   * Save the onboard status of a user
   */
  public async saveOnboardStatus(userId: string, status: "ONBOARDED" | "NOT_ONBOARDED") {
    const key = `onboard-status:${userId}`;
    await this.ctx.cache.setWithExpiry(key, status, 60 * Minute);
  }

  /**
   * Get the onboard status of a user
   */
  public async getOnboardStatus(userId: string) {
    const key = `onboard-status:${userId}`;
    const status = await this.ctx.cache.get(key);
    if (!status) return null;
    return status as "ONBOARDED" | "NOT_ONBOARDED";
  }

  /**
   * Update the onboard status of a user
   */
  public async updateOnboardStatus(userId: string, status: "ONBOARDED" | "NOT_ONBOARDED") {
    const key = `onboard-status:${userId}`;
    const onboardStatus = await this.ctx.cache.get(key);
    if (!onboardStatus) return null;
    await this.ctx.cache.setWithExpiry(key, status, 60 * Minute);
    return status;
  }
}
