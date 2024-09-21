/* eslint-disable no-console */

import debug from "debug";

type Level = "debug" | "info" | "warn" | "error";

const SESSION_KEY = "votewise:debug";

if (typeof window !== "undefined") {
  if (window.location.search.includes("debug")) {
    sessionStorage.setItem(SESSION_KEY, "true");
  }

  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    debug.enable("*");
    console.warn("Debug logs enabled");
  }

  if (process.env.NODE_ENV === "development") {
    debug.enable("*,-micromark");
    console.warn("Debug logs enabled");
  }
}

export class Debugger {
  private readonly _debug: debug.Debugger;

  constructor(namespace: string) {
    this._debug = debug(namespace);
  }

  get enabled() {
    return this._debug.enabled;
  }

  debug(message: string, ...args: unknown[]) {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log("error", message, ...args);
  }

  log(level: Level, message: string, ...args: unknown[]) {
    this._debug.log = console[level].bind(console);
    this._debug(`[${level.toUpperCase()}] ${message}`, ...args);
  }

  namespace(extra: string) {
    const currentNamespace = this._debug.namespace;
    return new Debugger(`${currentNamespace}:${extra}`);
  }
}
