import cluster from "cluster";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import os from "os";
import pino from "pino";

// -----------------------------------------------------------------------------------------

dotenv.config();

// -----------------------------------------------------------------------------------------
const app = express();
const numCPUs = os.cpus().length;
const logger = pino();
const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);

// -----------------------------------------------------------------------------------------
// =================== CLUSTER ===================
logger.info(`Current Machine has ${numCPUs} CPUs`);
if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running`);

  // For workers
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  // In case of worker died, then need to restart the worker. So, we can assure that the server is always running.
  cluster.on("exit", (worker) => {
    logger.info(`Worker ${worker.process.pid} died....`);

    // Restart the worker
    cluster.fork();
  });
} else {
  httpServer.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

// -----------------------------------------------------------------------------------------
process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

// -----------------------------------------------------------------------------------------
export default app;
