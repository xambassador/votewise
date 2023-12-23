import RedisAdapter from "@/src/redis";

/** Save a session in Redis. Key must be prefixed with `user:`. */
export async function saveSessionWithExpiration(
  key: string,
  value: {
    userId: string;
    csrfToken: string;
    expiresAt: number;
    accessToken: string;
  },
  expiresIn: number
) {
  await RedisAdapter.defaultClient.setex(key, expiresIn, JSON.stringify(value));
}

/** Get a session from Redis. Key must be prefixed with `user:`. */
export async function getSession(key: string) {
  const session = await RedisAdapter.defaultClient.get(key);
  return session
    ? (JSON.parse(session) as {
        userId: string;
        csrfToken: string;
        expiresAt: number;
        accessToken: string;
      })
    : null;
}
