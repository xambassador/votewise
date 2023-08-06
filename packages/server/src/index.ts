import cluster from "cluster";
import express from "express";
import http from "http";
import os from "os";
import stoppable from "stoppable";

import dotenv from "dotenv";

/* ----------------------------------------------------------------------------------------------- */
import Logger from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { registerMiddlewares } from "@/src/middlewares";
import { registerRoutes } from "@/src/routes";
import "@/src/types";

/* ----------------------------------------------------------------------------------------------- */

dotenv.config();

const app = express();
const numCPUs = os.cpus().length;
const port = process.env.PORT || 5000;

/* -----------------------------------------------------------------------------------------------
 * The amount of time to wait for connections to close before forcefully
 * closing them. This allows for regular HTTP requests to complete but
 * prevents long running requests from blocking shutdown.
 * -----------------------------------------------------------------------------------------------*/
const connectionGraceTimeout = 5 * 1000;
const httpServer = stoppable(http.createServer(app), connectionGraceTimeout);

/* -------------------------------- */
registerMiddlewares(app);
registerRoutes(app);

const forkWorkers = () => {
  Logger.info("LIFECYCLE", `Current Machine has ${numCPUs} CPUs`);
  if (cluster.isPrimary) {
    Logger.info("MASTER", `Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i += 1) {
      cluster.fork();
    }

    // In case of worker died, then need to restart the worker. So, we can assure that the server is always running.
    cluster.on("exit", (worker) => {
      Logger.info(
        "WORKER",
        `🚨 ${worker.process.pid} Worker process terminated unexpectedly. 🚀 Respawn Engaged!. A new launch sequence is underway.`
      );

      // Restart the worker
      cluster.fork();
    });
  } else {
    httpServer.listen(port, () => {
      Logger.info(
        "LIFECYCLE",
        `🚀 Server is taking off! You're now cruising on port ${port}. Have a smooth journey!`
      );
    });
  }
};

if (process.env.NODE_ENV === "production") {
  forkWorkers();
}

if (process.env.NODE_ENV === "development") {
  httpServer.listen(port, () => {
    Logger.info(
      "LIFECYCLE",
      `🚀 Server is taking off! You're now cruising on port ${port}. Have a smooth journey!`
    );
  });
}

process.on("uncaughtException", (err) => {
  Logger.error(
    "LIFECYCLE",
    `🚀 Launch Aborted! An unexpected error delays liftoff. We're recalibrating the countdown sequence.`,
    { error: err }
  );
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  Logger.info(
    "LIFECYCLE",
    `[🚨] 🚀 Rocket Docking Initiated! SIGTERM received. Engines throttling down for a graceful touchdown.`
  );

  httpServer.close(() => {
    Logger.info(
      "LIFECYCLE",
      `🛑 ✅ Mission Accomplished! Your server is signing off. Until we launch again, over and out!`
    );

    // Close the database connection
    prisma.$disconnect();

    // Gracefully exit the process
    process.exit(0);
  });
});

export default app;
