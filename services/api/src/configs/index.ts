/**
 * Application settings
 */
export const APP_SETTINGS = {
  CONNECTION_GRACE_TIMEOUT: 5 * 1000,
  WORKER_GRACE_TIMEOUT: 5 * 1000, // 5 seconds
  DEFAULT_PORT: 5001,
  FORCE_QUIT_TIMEOUT: 60 * 1000, // 60 seconds
  REDIS: {
    MAX_RETRIES_PER_REQUEST: 3,
    MAX_LISTENERS: 100,
    CLIENT_SUFFIX: "client",
    SUBSCRIBER_SUFFIX: "subscriber",
  },
  API: {
    DEFAULT_LIMIT: 50,
    DEFAULT_OFFSET: 0,
  },
  JWT: {
    ACCESS_TOKEN_EXPIRATION: "15m",
    REFRESH_TOKEN_EXPIRATION: "7d",
  },
};
