import pino from "pino";

import dotenv from "dotenv";

dotenv.config();

const pinoInit = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      colorize: true,
      crlf: true,
      levelFirst: true,
      messageFormat: false,
      messageKey: "message",
      timestampKey: "time",
      base: null,
      search: null,
    },
  },
});

const logger = (text: unknown, level = "info") => {
  const isTestEnv = process.env.NODE_ENV === "test";
  if (isTestEnv) {
    return;
  }
  switch (level) {
    case "info":
      pinoInit.info(text);
      break;
    case "error":
      pinoInit.error(text);
      break;
    case "warn":
      pinoInit.warn(text);
      break;
    case "debug":
      pinoInit.debug(text);
      break;
    default:
      pinoInit.info(text);
      break;
  }
};

export { logger };
