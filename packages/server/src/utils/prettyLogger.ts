/* eslint-disable @typescript-eslint/no-use-before-define */
import bytes from "bytes";
import type { Chalk } from "chalk";
import chalk from "chalk";
import type { NextFunction, Request, Response } from "express";
import util from "util";

const colorCodes: Record<number, string> = {
  7: "magenta",
  5: "red",
  4: "yellow",
  3: "cyan",
  2: "green",
  1: "green",
  0: "yellow",
};

const timeColorMap = {
  "<50ms": chalk.green,
  "<100ms": chalk.magenta,
  ">=100ms": chalk.red,
};

const chalkColorsMap: Record<string, Chalk> = {
  magenta: chalk.magenta,
  red: chalk.red,
  yellow: chalk.yellow,
  cyan: chalk.cyan,
  green: chalk.green,
  blue: chalk.blue,
  white: chalk.white,
  gray: chalk.gray,
  grey: chalk.grey,
};

type Options = {
  delimiter?: string;
  separator?: string;
};

function humanize(n: string, o?: Options) {
  const options = o || {};
  const d = options.delimiter || ",";
  const s = options.separator || ".";
  const number = n.toString().split(".");
  number[0] = number[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${d}`);
  return number.join(s);
}

function formatResponseTime(responseTime: number) {
  const t = time(responseTime);
  const match = t.match(/(\d+)(ms|s)/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    const milliseconds = unit === "ms" ? value : value * 1000;

    if (milliseconds < 50) return timeColorMap["<50ms"](t);
    if (milliseconds < 100) return timeColorMap["<100ms"](t);
    return timeColorMap[">=100ms"](t);
  }

  return t;
}

function time(start: number) {
  const delta = Date.now() - start;
  return humanize(delta < 10000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`);
}

function log(
  print: (...args: unknown[]) => void,
  ctx: {
    request: Request;
    response: Response;
  },
  start: number,
  length_: number | null,
  err: Error | null,
  event?: string
) {
  // get the status code of the response
  const status = err ? (err as any).status || 500 : ctx.response.statusCode || 404;

  // set the color of the status code;
  // eslint-disable-next-line no-bitwise
  const s = (status / 100) | 0;

  // eslint-disable-next-line no-prototype-builtins
  const color = colorCodes.hasOwnProperty(s) ? colorCodes[s] : colorCodes[0];

  // get the human readable response length
  let length: string;

  /* -----------------------------------------------------------------------------------------------
   * 204: no content
   * 205: reset content
   * 304: not modified
   * Typically these status codes should result in no response body.
   * -----------------------------------------------------------------------------------------------*/
  if ([204, 205, 304].includes(status)) {
    length = "";
  } else if (length_ == null) {
    length = "-";
  } else {
    length = bytes(length_).toLowerCase();
  }

  let upstream: string;
  if (err) {
    upstream = chalk.red("xxx");
  } else if (event === "close") {
    upstream = chalk.yellow("-x-");
  } else {
    upstream = chalk.gray("-->");
  }

  print(
    `${chalk.gray("[OUTGOING]")} ${upstream} ${chalk.bold("%s")} ${chalk.gray("%s")} ${chalkColorsMap[color](
      "%s"
    )} %s ${chalk.gray("%s")}`,
    ctx.request.method,
    ctx.request.originalUrl,
    status,
    formatResponseTime(start),
    length
  );
}

type PrettyLoggerOptions =
  | {
      transporter?: (string: string, args: unknown[]) => void;
    }
  | ((string: string, args: unknown[]) => void);

const getPrintFunction = (options?: PrettyLoggerOptions) => {
  let transporter: ((string: string, args: unknown[]) => void) | undefined;
  if (typeof options === "function") {
    transporter = options;
  } else if (options && options.transporter) {
    transporter = options.transporter;
  }

  return function printFunc(...args: unknown[]) {
    const string = util.format(...args);
    if (transporter) transporter(string, args);
    // eslint-disable-next-line no-console
    else console.log(...args);
  };
};

export const prettyLogger = (options?: PrettyLoggerOptions) => {
  const print = getPrintFunction(options);

  return async (request: Request, response: Response, next: NextFunction) => {
    const start = Date.now();

    print(
      `${chalk.gray("[INCOMING]")} ${chalk.gray("<--")} ${chalk.bold("%s")} ${chalk.gray("%s")}`,
      request.method,
      request.originalUrl
    );

    try {
      await next();
    } catch (err: any) {
      log(print, { request, response }, start, null, err);
      throw err;
    }

    const onFinish = done.bind(null, "finish");
    const onClose = done.bind(null, "close");

    function done(event: string) {
      response.removeListener("finish", onFinish);
      response.removeListener("close", onClose);

      const length = response.getHeader("content-length")
        ? parseInt(response.getHeader("content-length") as string, 10)
        : null;

      log(print, { request, response }, start, length, null, event);
    }

    response.once("finish", onFinish);
    response.once("close", onClose);
  };
};
