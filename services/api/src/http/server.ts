import "@/types";

import http from "http";
import https from "https";
import express from "express";
import stoppable from "stoppable";

import logger from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { APP_SETTINGS } from "@/configs";

import env from "@/infra/env";

import { registerMiddlewares } from "@/http/middlewares";
import { registerV1Routes } from "@/http/routers";

import { checkEnv, getSSL, ShutdownManager, ShutdownOrder, taskforce } from "@/utils";

/* ----------------------------------------------------------------------------------------------- */

const port = process.env.PORT || APP_SETTINGS.DEFAULT_PORT;

/**
 * The amount of time to wait for connections to close before forcefully
 * closing them. This allows for regular HTTP requests to complete but
 * prevents long running requests from blocking shutdown.
 */
const connectionGraceTimeout = APP_SETTINGS.CONNECTION_GRACE_TIMEOUT;

async function master() {
  await checkEnv();
}

async function start(_: number, disconnect: () => void) {
  const ssl = getSSL();
  const useHTTPS = !!ssl.key && !!ssl.cert;

  const app = express();
  const httpServer = stoppable(
    useHTTPS ? https.createServer(ssl, app) : http.createServer(app),
    connectionGraceTimeout
  );

  registerMiddlewares(app);
  registerV1Routes(app);

  httpServer.listen(port, () => {
    logger.info(
      `🚀 Server is taking off! You're now cruising on port ${port} under ${
        useHTTPS ? "https" : "http"
      }. Have a smooth journey!`
    );
  });

  httpServer.setTimeout(env.REQUEST_TIMEOUT);

  httpServer.on("error", (err) => {
    throw err;
  });

  ShutdownManager.add("server", ShutdownOrder.last, () => {
    return new Promise((resolve, reject) => {
      logger.info(
        `[🚨] 🚀 Rocket Docking Initiated! SIGTERM received. Engines throttling down for a graceful touchdown.`
      );

      // Stop the server from accepting new connections and finishes existing connections.
      httpServer.stop((err, gracefully) => {
        // Disconnect all the workers
        disconnect();

        if (err) {
          logger.error(`🚨 Rocket Docking Failed! Unable to stop the server gracefully.`);
          reject(err);
          return;
        }

        // Close the database connection
        prisma
          .$disconnect()
          .then(() => {
            logger.info(`🚀 Rocket Docking Successful! Database connection closed.`);
          })
          .catch((reason) => {
            logger.error(`🚨 Rocket Docking Failed! Unable to close the database connection.`, {
              reason,
            });
          });

        resolve(gracefully);

        if (gracefully) {
          logger.info(
            `✅ Mission Accomplished! Your server is signing off. Until we launch again, over and out!`
          );
        } else {
          logger.info(
            `🛑 🚨 Mission Aborted! Your server is signing off. Until we launch again, over and out!`
          );
        }
      });
    });
  });

  process.once("uncaughtException", (err) => {
    logger.error(
      `🚀 Launch Aborted! An unexpected error delays liftoff. We're recalibrating the countdown sequence.`,
      { error: err }
    );
    ShutdownManager.shutdown();
    process.exit(1);
  });

  // Handle shutdown signals
  process.once("SIGTERM", () => ShutdownManager.shutdown());
  process.once("SIGINT", () => ShutdownManager.shutdown());
}

taskforce({
  master,
  worker: start,
  count: env.CONCURRENCY,
});
