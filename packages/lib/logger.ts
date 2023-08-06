import chalk from "chalk";
import dotenv from "dotenv";
import { isArray, isEmpty, isObject, isString } from "lodash";
import pino from "pino";
import winston from "winston";

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

type LoggerLevel = "info" | "error" | "warn" | "debug";

const logger = (text: unknown, level: LoggerLevel = "info") => {
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

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || "info";

type LogCategory =
  | "LIFECYCLE"
  | "HTTP"
  | "COMMANDS"
  | "WORKER"
  | "TASK"
  | "PROCESSOR"
  | "EMAIL"
  | "QUEUE"
  | "WEBSOCKETS"
  | "DATABASE"
  | "MASTER"
  | "UTILS";

type Extra = Record<string, unknown>;

class Logger {
  output: winston.Logger;

  public constructor() {
    this.output = winston.createLogger({
      level: ["error", "warn", "info", "http", "verbose", "debug", "silly"].includes(logLevel)
        ? logLevel
        : "info",
    });

    this.output.add(
      new winston.transports.Console({
        format: isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf((info) => {
                const { message, level, timestamp, label, ...extra } = info;
                return `${level} ${chalk.gray("[" + timestamp + "]")} ${chalk.cyanBright(
                  "[" + label + "]"
                )} ${message} ${isEmpty(extra) ? "" : extra}`;
              })
            ),
      })
    );
  }

  public info(label: LogCategory, message: string, extra?: Extra) {
    this.output.info(message, { label, ...extra });
  }

  public debug(label: LogCategory, message: string, extra?: Extra) {
    this.output.debug(message, { label, ...extra });
  }

  public warn(label: LogCategory, message: string, extra?: Extra) {
    this.output.warn(message, { label, ...extra });
  }

  public error(label: LogCategory, message: string, extra?: Extra) {
    this.output.error(message, { label, ...extra });
  }

  public errorInfo(message: string, context: string) {
    const label = "ERROR";
    const formatedContext = context ? chalk.cyanBright("[" + chalk.redBright(context) + "]") : "";
    const formatedMessage = `${formatedContext} ${message}`;
    this.output.error(formatedMessage, { label });
  }

  private sanitize<T>(data: T): T {
    if (!isProduction) {
      return data;
    }

    const sensitiveFields = ["accessToken", "refreshToken", "token", "password", "database", "content"];

    if (isString(data)) {
      if (sensitiveFields.some((field) => data.includes(field))) {
        return "[REDACTED]" as unknown as T;
      }
    }

    if (isArray(data)) {
      return data.map(this.sanitize) as unknown as T;
    }

    if (isObject(data)) {
      const output = { ...data };

      for (const key of Object.keys(output)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (isObject(output[key])) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          output[key] = this.sanitize(output[key]);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } else if (isArray(output[key])) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          output[key] = output[key].map(this.sanitize);
        } else if (sensitiveFields.includes(key)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          output[key] = "[REDACTED]";
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          output[key] = this.sanitize(output[key]);
        }
      }
      return output;
    }

    return data;
  }
}

export default new Logger();
