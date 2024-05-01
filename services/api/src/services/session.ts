import type { TSession } from "@/types/session";

import Redis from "@/infra/redis";

import { generateHexId } from "@/utils/index";

export class Session {
  private readonly _redis = Redis.defaultClient;

  /**
   * Create a new session for a user
   *
   * @param {TSession} data Session data
   * @returns {Promise<string>}  Session ID
   */
  public async create(
    data: Omit<TSession, "session_id" | "session_token">
  ): Promise<{ sessionId: string; sessionToken: string }> {
    const key = data.user_id;
    const sessionId = this.generateSessionId();
    const sessionToken = this.generateSessionToken();
    await this._redis.set(key, JSON.stringify({ ...data, sessionId, sessionToken }));
    return { sessionId, sessionToken };
  }

  /**
   * Get a session for a user
   *
   * @param {string} userId User ID
   * @returns {Promise<TSession | null>} Session data
   */
  public async get(userId: string): Promise<TSession | null> {
    const sessionData = await this._redis.get(userId);
    return sessionData ? (JSON.parse(sessionData) as TSession) : null;
  }

  /**
   * Delete a session for a user
   *
   * @param {string} userId User ID
   * @returns {Promise<void>}
   */
  public async delete(userId: string): Promise<void> {
    await this._redis.del(userId);
  }

  /**
   * Update a session for a user
   *
   * @param {TSession} data Session data
   * @returns {Promise<string>} Session ID
   */
  public async update(data: TSession): Promise<string> {
    const key = data.user_id;
    const sessionData = JSON.stringify(data);
    await this._redis.set(key, sessionData);
    return data.session_id;
  }

  /**
   * Generate a session ID
   *
   * @private
   * @returns {string} Session ID
   */
  private generateSessionId(): string {
    return generateHexId();
  }

  /**
   * Generate a session token
   *
   * @private
   * @returns {string} Session token
   */
  private generateSessionToken(): string {
    return generateHexId();
  }
}
