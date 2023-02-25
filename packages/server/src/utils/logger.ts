import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const pinoInit = pino({
  level: process.env.LOG_LEVEL || "info",
});

const logger = (text: string | Error, level = "info") => {
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
