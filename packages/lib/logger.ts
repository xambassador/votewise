/* eslint-disable no-console */

import { isArray, isObject, isString } from "lodash";
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

type Extra = Record<string, unknown>;

class Logger {
  output: pino.Logger;

  public constructor(options: pino.LoggerOptions = {}) {
    this.output = pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty"
      },
      base: null,
      timestamp: false,
      ...options
    });
  }

  public log(message: string) {
    this.output.info(message);
  }

  public info(message: string, extra?: Extra) {
    if (!extra) return this.output.info(message);
    return this.output.info({ message, ...extra });
  }

  public debug(message: string, extra?: Extra) {
    this.output.debug({ message, ...extra });
  }

  public warn(message: string, extra?: Extra) {
    if (isProduction) {
      this.output.warn(message, this.sanitize(extra));
    } else if (extra) {
      console.warn(message, extra);
    } else {
      console.warn(message);
    }
  }

  public error(message: string, extra?: Extra) {
    if (!extra) return this.output.error(message);
    return this.output.error({ message, ...extra });
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

  /**
   * Synchonously log a message
   *
   * @param message - Message to log
   */
  public logSync(message: string) {
    console.log(message);
  }

  /**
   * Synchonously log an error
   *
   * @param error - Error to log
   */
  public errorSync(...args: unknown[]) {
    console.error(args);
  }
}

export { Logger };
export default new Logger();
