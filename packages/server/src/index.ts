/**
 * @file: index.ts
 * @description: Entry point for the application
 */
import cluster from "cluster";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import os from "os";

import { registerMiddlewares } from "./middlewares";
import { registerRoutes } from "./routes";
import { logger } from "./utils";

// -----------------------------------------------------------------------------------------

dotenv.config();

// -----------------------------------------------------------------------------------------
const app = express();
const numCPUs = os.cpus().length;
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// -----------------------------------------------------------------------------------------
// =================== Register middlewares ===================
registerMiddlewares(app);

// -----------------------------------------------------------------------------------------
// =================== Register routes ===================
registerRoutes(app);

// -----------------------------------------------------------------------------------------
// =================== CLUSTER ===================
// TODO: Move this to a separate file
const forkWorkers = () => {
  logger(`Current Machine has ${numCPUs} CPUs`);
  if (cluster.isPrimary) {
    logger(`Master ${process.pid} is running`);

    // For workers
    for (let i = 0; i < numCPUs; i += 1) {
      cluster.fork();
    }

    // In case of worker died, then need to restart the worker. So, we can assure that the server is always running.
    cluster.on("exit", (worker) => {
      logger(`Worker ${worker.process.pid} died....`);

      // Restart the worker
      cluster.fork();
    });
  } else {
    httpServer.listen(port, () => {
      logger(`Server is running on port ${port}`);
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

// -----------------------------------------------------------------------------------------
process.on("uncaughtException", (err) => {
  logger(err, "error");
  process.exit(1);
});

// -----------------------------------------------------------------------------------------
export default app;
export { httpServer };
