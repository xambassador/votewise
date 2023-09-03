import dotenv from "dotenv";
import express from "express";
import http from "http";
import https from "https";
import stoppable from "stoppable";

import Logger from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { registerMiddlewares } from "@/src/middlewares";
import { registerRoutes } from "@/src/routes";
import { taskforce } from "@/src/utils/cluster";
import ShutdownManager, { ShutdownOrder } from "@/src/utils/shutdown";
import { getSSL } from "@/src/utils/ssl";
import { checkEnv } from "@/src/utils/startup";

import "@/src/types";

import env from "./env";
/* ----------------------------------------------------------------------------------------------- */

dotenv.config();

const port = process.env.PORT || 5001;

/* -----------------------------------------------------------------------------------------------
 * The amount of time to wait for connections to close before forcefully
 * closing them. This allows for regular HTTP requests to complete but
 * prevents long running requests from blocking shutdown.
 * -----------------------------------------------------------------------------------------------*/
const connectionGraceTimeout = 5 * 1000;

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
  registerRoutes(app);

  httpServer.listen(port, () => {
    Logger.info(
      "LIFECYCLE",
      `🚀 Server is taking off! You're now cruising on port ${port} under ${
        useHTTPS ? "https" : "http"
      }. Have a smooth journey!`
    );
  });

  httpServer.setTimeout(env.REQUEST_TIMEOUT);

  httpServer.on("error", (err) => {
    throw err;
  });

  ShutdownManager.add(
    "server",
    ShutdownOrder.last,
    () =>
      new Promise((resolve, reject) => {
        Logger.info(
          "LIFECYCLE",
          `[🚨] 🚀 Rocket Docking Initiated! SIGTERM received. Engines throttling down for a graceful touchdown.`
        );

        // Stop the server from accepting new connections and finishes existing connections.
        httpServer.stop((err, gracefully) => {
          // Disconnect all the workers
          disconnect();

          if (err) {
            Logger.error("LIFECYCLE", `🚨 Rocket Docking Failed! Unable to stop the server gracefully.`);
            reject(err);
            return;
          }

          // Close the database connection
          prisma
            .$disconnect()
            .then(() => {
              Logger.info("LIFECYCLE", `🚀 Rocket Docking Successful! Database connection closed.`);
            })
            .catch((reason) => {
              Logger.error(
                "LIFECYCLE",
                `🚨 Rocket Docking Failed! Unable to close the database connection.`,
                { reason }
              );
            });

          resolve(gracefully);

          if (gracefully) {
            Logger.info(
              "LIFECYCLE",
              `✅ Mission Accomplished! Your server is signing off. Until we launch again, over and out!`
            );
          } else {
            Logger.info(
              "LIFECYCLE",
              `🛑 🚨 Mission Aborted! Your server is signing off. Until we launch again, over and out!`
            );
          }
        });
      })
  );

  process.once("uncaughtException", (err) => {
    Logger.error(
      "LIFECYCLE",
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
