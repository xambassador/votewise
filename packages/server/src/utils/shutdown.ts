import groupby from "lodash/groupBy";

import Logger from "@votewise/lib/logger";

import { timeout } from "./timeout";
/* ----------------------------------------------------------------------------------------------- */

export enum ShutdownOrder {
  first = 0,
  normal = 1,
  last = 2,
}

type Handler = {
  name: string;
  order: ShutdownOrder;
  callback: () => Promise<unknown>;
};

export default class ShutdownManager {
  /**
   * The amount of time to wait for connections to close before forcefully
   * closing them. This allows for regular HTTP requests to complete but
   * prevents long running requests from blocking shutdown.
   */
  public static readonly connectionGraceTimeout = 5 * 1000; // 5 seconds

  /**
   * The maximum amount of time to wait for ongoing work to finish before
   * force quitting the process. In the event of a force quit, the process
   * will exit with a non-zero exit code.
   */
  public static readonly forceQuitTimeout = 60 * 1000;

  /** Whether the server is currently shutting down */
  private static isShuttingDown = false;

  /** List of shutdown handlers to execute */
  private static handlers: Handler[] = [];

  public static add(name: string, order: ShutdownOrder, cb: () => Promise<unknown>) {
    this.handlers.push({ name, order, callback: cb });
  }

  public static async shutdown() {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

    // Force quit after timeout
    timeout(this.forceQuitTimeout).then(() => {
      Logger.info("LIFECYCLE", "Force quitting after timeout");
      process.exit(1);
    });

    const shutdownGroups = groupby(this.handlers, "order");
    const shutdownOrder = Object.keys(shutdownGroups).sort();

    // Execute shutdown handlers in order
    // eslint-disable-next-line no-restricted-syntax
    for (const order of shutdownOrder) {
      Logger.debug("LIFECYCLE", `Executing shutdown handlers for order ${order}`);
      const handlers = shutdownGroups[order];

      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled(
        handlers.map(async (handler) => {
          Logger.debug("LIFECYCLE", `Executing shutdown handler ${handler.name}`);

          await handler.callback().catch((err) => {
            Logger.error("LIFECYCLE", `Error executing shutdown handler ${handler.name}`, { error: err });
          });
        })
      );
    }

    Logger.info("LIFECYCLE", "Gracefully quitting");
    Logger.info("LIFECYCLE", "🚀 Server has landed! Have a nice day!");
    process.exit(0);
  }
}
