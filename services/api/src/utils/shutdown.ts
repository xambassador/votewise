import groupby from "lodash/groupBy";

import logger from "@votewise/lib/logger";

import { APP_SETTINGS } from "@/configs";

import { timeout } from "@/utils";

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

export class ShutdownManager {
  /**
   * The amount of time to wait for connections to close before forcefully
   * closing them. This allows for regular HTTP requests to complete but
   * prevents long running requests from blocking shutdown.
   */
  public static readonly connectionGraceTimeout = APP_SETTINGS.CONNECTION_GRACE_TIMEOUT;

  /**
   * The maximum amount of time to wait for ongoing work to finish before
   * force quitting the process. In the event of a force quit, the process
   * will exit with a non-zero exit code.
   */
  public static readonly forceQuitTimeout = APP_SETTINGS.FORCE_QUIT_TIMEOUT;

  /** Whether the server is currently shutting down */
  private static isShuttingDown = false;

  /** List of shutdown handlers to execute */
  private static readonly handlers: Handler[] = [];

  /**
   * Add a shutdown handler to the list of handlers to execute
   *
   * @param name Name of the task to shutdown
   * @param order Order of the task to shutdown
   * @param cb Callback function to execute
   */
  public static add(name: string, order: ShutdownOrder, cb: () => Promise<unknown>) {
    this.handlers.push({ name, order, callback: cb });
  }

  /**
   * Shutdown the server gracefully. This will execute all shutdown handlers in order and then exit
   */
  public static async shutdown() {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

    // Force quit after timeout
    timeout(this.forceQuitTimeout).then(() => {
      logger.info("Force quitting after timeout");
      process.exit(1);
    });

    const shutdownGroups = groupby(this.handlers, "order");
    const shutdownOrder = Object.keys(shutdownGroups).sort();

    // Execute shutdown handlers in order
    for (const order of shutdownOrder) {
      logger.debug(`Executing shutdown handlers for order ${order}`);
      const handlers = shutdownGroups[order];

      await Promise.allSettled(
        handlers.map(async (handler) => {
          logger.debug(`Executing shutdown handler ${handler.name}`);

          await handler.callback().catch((err) => {
            logger.error(`Error executing shutdown handler ${handler.name}`, { error: err });
          });
        })
      );
    }

    logger.info("Gracefully quitting");
    logger.info("🚀 Server has landed! Have a nice day!");
    process.exit(0);
  }
}
