import cluster from "cluster";
import express from "express";
import http from "http";
import os from "os";

import dotenv from "dotenv";

/* ----------------------------------------------------------------------------------------------- */
import { logger } from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { registerMiddlewares } from "@/src/middlewares";
import { registerRoutes } from "@/src/routes";
import "@/src/types";

/* ----------------------------------------------------------------------------------------------- */

dotenv.config();

const app = express();
const numCPUs = os.cpus().length;
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

/* -------------------------------- */
registerMiddlewares(app);
registerRoutes(app);

const forkWorkers = () => {
  logger(`▶️▶️▶️▶️▶️▶️ Current Machine has ${numCPUs} CPUs`);
  if (cluster.isPrimary) {
    logger(`▶️▶️▶️▶️▶️▶️ Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i += 1) {
      cluster.fork();
    }

    // In case of worker died, then need to restart the worker. So, we can assure that the server is always running.
    cluster.on("exit", (worker) => {
      logger(`▶️▶️▶️▶️▶️▶️ Worker ${worker.process.pid} died....`);

      // Restart the worker
      cluster.fork();
    });
  } else {
    httpServer.listen(port, () => {
      logger(`▶️▶️▶️▶️▶️▶️ Server is running on port ${port}`);
    });
  }
};

if (process.env.NODE_ENV === "production") {
  forkWorkers();
}

if (process.env.NODE_ENV === "development") {
  httpServer.listen(port, () => {
    logger(`Server is running on port ${port}`);
  });
}

process.on("uncaughtException", (err) => {
  logger(err, "error");
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger("🚨 SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    logger(`🚨🚨🚨 💤Server is going to shutdown .....`);

    // Close the database connection
    prisma.$disconnect();

    // Gracefully exit the process
    logger(`💤💤💤Server is shutdown .....`);
    process.exit(0);
  });
});

export default app;
