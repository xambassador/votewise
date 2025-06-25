import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type AvailableScenarios =
  | "networkDelay"
  | "timeout"
  | "serverError"
  | "badGateway"
  | "partialFailure"
  | "memoryLeak"
  | "uncaughtException"
  | "unhandledRejection"
  | "processExit"
  | "corruptedResponse";
type Options = {
  globalChaosRate?: number;
  scenarios?: Partial<Record<AvailableScenarios, number>>;
  delays?: {
    min?: number;
    max?: number;
    timeoutDelay?: number;
  };
  logChaos?: (message: string) => void;
  excludeRoutes?: string[];
  enabled?: boolean;
  corruptionRate?: number;
  serverTimeout?: number;
  sendJsonResponse?: boolean;
  createError?: (scenario: AvailableScenarios) => unknown;
};

const defaultOptions: Options = {
  scenarios: {
    badGateway: 0.02,
    networkDelay: 0.05,
    timeout: 0.03,
    serverError: 0.04,
    corruptedResponse: 0.02,
    partialFailure: 0.02,
    uncaughtException: 0.01,
    unhandledRejection: 0.01,
    memoryLeak: 0.01
  },
  delays: {
    min: 1000,
    max: 5000,
    timeoutDelay: 30000
  },
  serverTimeout: 60000,
  excludeRoutes: [],
  enabled: true,
  sendJsonResponse: true,
  corruptionRate: 0.1,
  globalChaosRate: 0.1
};

export class ChaosMonkey {
  private readonly options: Options;
  private readonly stats: {
    totalRequests: number;
    chaosActivated: number;
    scenarioStats: Record<AvailableScenarios, number>;
  };

  /**
   * Chaos Monkey middleware to introduce chaos scenarios in application.
   *
   * @param {Options} opts  - Chaos Monkey options
   * @param {Options["globalChaosRate"]} opts.globalChaosRate - Global chaos activation rate (default: 0.1) between 0 and 1
   * @param {Options["scenarios"]} opts.scenarios - Scenarios with their weights. Heavier weights mean more frequent activation.
   * @param {Options["delays"]} opts.delays - Delay settings for network delay scenario
   * @param {Options["logChaos"]} opts.logChaos - Function to log chaos messages from Chaos Monkey
   * @param {Options["excludeRoutes"]} opts.excludeRoutes - Array of routes to exclude from chaos scenarios
   * @param {Options["enabled"]} opts.enabled - Enable or disable Chaos Monkey (default: true)
   * @param {Options["sendJsonResponse"]} opts.sendJsonResponse - Whether to send JSON responses for chaos scenarios (default: true)
   * @param {Options["createError"]} opts.createError - Function to return custom error response for chaos scenarios
   * @param {Options["corruptionRate"]} opts.corruptionRate - Rate of data corruption in corruptedResponse and partialFailure scenarios (default: 0.1)
   * @param {Options["serverTimeout"]} opts.serverTimeout - Server timeout for chaos scenarios. Set this value to your server's timeout setting to test the timeout scenario (default: 60000)
   */
  constructor(opts: Options = {}) {
    this.options = Object.assign({}, defaultOptions, opts);
    const scenarioStats: Record<AvailableScenarios, number> = {} as Record<AvailableScenarios, number>;
    Object.keys(this.options.scenarios || {}).forEach((scenario) => {
      scenarioStats[scenario as AvailableScenarios] = 0;
    });
    this.stats = {
      totalRequests: 0,
      chaosActivated: 0,
      scenarioStats
    };

    if (this.options.enabled) {
      setInterval(() => this.reportChaos(), 60000);
    }
  }

  /**
   *  Registers the Chaos Monkey middleware
   */
  public register() {
    this.options.logChaos?.(`
-----------------------------------------------------------------------
🙈🐵 Chaos Monkey is registered and ready to activate chaos scenarios.
-----------------------------------------------------------------------`);
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.options.enabled) {
        return next();
      }

      this.stats.totalRequests++;

      if (this.shouldExcludeRoute(req.path)) {
        return next();
      }

      if (!this.shouldActivateChaos()) {
        return next();
      }

      this.stats.chaosActivated++;
      const scenario = this.selectChaosScenario();
      if (!scenario) {
        return next();
      }
      return this.executeChaosScenario(scenario, req, res, next);
    };
  }

  private shouldActivateChaos() {
    return Math.random() < (this.options.globalChaosRate || 0.1);
  }

  public getStats() {
    return {
      ...this.stats,
      chaosRate:
        this.stats.totalRequests > 0 ? ((this.stats.chaosActivated / this.stats.totalRequests) * 100).toFixed(2) : 0
    };
  }

  private shouldExcludeRoute(path: string) {
    return this.options.excludeRoutes?.some((route) => {
      path.startsWith(route) || path === route;
    });
  }

  private selectChaosScenario() {
    const activatedScenarios = Object.entries(this.options.scenarios || {}).filter(([, weight]) => weight > 0);
    if (activatedScenarios.length === 0) {
      this.options.logChaos?.("No chaos scenarios are activated.");
      return null;
    }
    const scenarios = this.options.scenarios;
    const totalWeight = Object.values(scenarios || {}).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [scenario, weight] of activatedScenarios) {
      random -= weight;
      if (random <= 0) {
        return scenario as AvailableScenarios;
      }
    }

    return null;
  }

  // eslint-disable-next-line consistent-return
  private executeChaosScenario(scenario: AvailableScenarios, req: Request, res: Response, next: NextFunction) {
    this.stats.scenarioStats[scenario]++;
    this.options.logChaos?.(`Chaos Monkey activated scenario: ${scenario} for request: ${req.method} ${req.path}`);
    const delay = this.randomBetween(this.options.delays?.min || 1000, this.options.delays?.max || 5000);

    switch (scenario) {
      case "badGateway": {
        const errorResponse = this.options.createError?.(scenario);
        if (this.options.sendJsonResponse) {
          return res.status(StatusCodes.BAD_GATEWAY).json(errorResponse ?? { error: { message: "Bad Gateway" } });
        }
        return res.status(StatusCodes.BAD_GATEWAY).send(errorResponse ?? "Bad Gateway");
      }
      case "uncaughtException": {
        this.options.logChaos?.(`Chaos Monkey uncaught exception for request: ${req.method} ${req.path}`);
        throw new Error(`Chaos Monkey uncaught exception for request: ${req.method} ${req.path}`);
      }
      case "unhandledRejection": {
        this.options.logChaos?.(`Chaos Monkey unhandled rejection for request: ${req.method} ${req.path}`);
        return Promise.reject(new Error(`Chaos Monkey unhandled rejection for request: ${req.method} ${req.path}`));
      }
      case "processExit": {
        this.options.logChaos?.(`Chaos Monkey process exit for request: ${req.method} ${req.path}`);
        return process.exit(1);
      }
      case "memoryLeak": {
        throw new Error("Chaos Monkey memory leak scenario is not implemented yet.");
      }
      case "networkDelay":
        setTimeout(() => {
          next();
        }, delay);
        break;

      case "corruptedResponse":
      case "partialFailure": {
        const original = res.send;
        const shouldFail = Math.random() < 0.5;
        res.send = (data: unknown) => {
          if (!shouldFail) {
            return original.call(res, data);
          }

          this.options.logChaos?.(`Chaos Monkey partial failure for request: ${req.method} ${req.path}`);
          if (typeof data === "string") {
            const index = Math.floor(Math.random() * data.length);
            const corruptedChar = String.fromCharCode(data.charCodeAt(index) + (Math.random() > 0.5 ? 1 : -1));
            const corruptedData = data.slice(0, index) + corruptedChar + data.slice(index + 1);
            return original.call(res, corruptedData);
          }

          if (typeof data === "object" && data !== null) {
            const keys = Object.keys(data);
            keys.forEach((key) => {
              if (shouldFail) {
                delete data[key as keyof typeof data];
              }
            });
            return original.call(res, data);
          }

          this.options.logChaos?.(
            `Chaos Monkey unknown data type detected for partial failure: ${req.method} ${req.path}`
          );
          return original.call(res, data);
        };
        return next();
      }
      case "serverError": {
        const errorResponse = this.options.createError?.(scenario);
        if (this.options.sendJsonResponse) {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse ?? { error: { message: "Internal Server Error" } });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse ?? "Internal Server Error");
      }
      case "timeout":
        // Just delay the response to simulate some heavy processing
        // If server sets a timeout, it will handle it
        setTimeout(() => next(), this.options.serverTimeout || 60000);
        break;
      default: {
        const errorResponse = this.options.createError?.(scenario);
        if (this.options.sendJsonResponse) {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse ?? { error: { message: "Chaos Monkey encountered an unknown scenario." } });
        }
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(errorResponse ?? "Chaos Monkey encountered an unknown scenario.");
      }
    }
  }

  private randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private reportChaos() {
    const stats = this.getStats();
    const scenarioStats = Object.entries(stats.scenarioStats).map(
      ([scenario, count]) =>
        `${scenario}: ${count} (${stats.totalRequests > 0 ? ((count / stats.totalRequests) * 100).toFixed(2) : 0}%)`
    );
    this.options.logChaos?.(
      `
------------------------------------------------------------------------
Chaos Monkey Report:
Total Requests: ${stats.totalRequests}
Chaos Activated: ${stats.chaosActivated}
Chaos Rate: ${stats.chaosRate}%

Scenario Statistics:
${scenarioStats.join("\n")}
------------------------------------------------------------------------`
    );
  }
}
