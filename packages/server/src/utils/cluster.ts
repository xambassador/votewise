import cluster from "cluster";
import os from "os";

import Logger from "@votewise/lib/logger";
/* ----------------------------------------------------------------------------------------------- */

const nCPU = os.cpus().length;
const grace = 5 * 1000; // 5 seconds
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

type Configs = {
  master: (pid: number) => void;
  worker: (pid: number, disconnect: () => void) => void;
  count?: number;
};

function getWorkersCount(count: number | undefined) {
  let totalWorkers = 1;
  if (count && count <= nCPU) totalWorkers = count;
  else if (count && count > nCPU) totalWorkers = nCPU;
  else totalWorkers = nCPU;
  return totalWorkers;
}

export async function taskforce(config: Configs) {
  let running = true;
  const { master, worker, count } = config;
  const totalWorkers = getWorkersCount(count);

  // Shutdown workers
  const shutdown = (signal: NodeJS.Signals) => {
    return () => {
      running = false;
      Logger.info("WORKER", `Received ${signal}. Shutting down...`);

      setTimeout(() => {
        Logger.info("WORKER", `Grace period ended. Forcing shutdown if needed`);

        // Check if there are any workers left
        if (Object.values(cluster.workers || {}).length === 0) {
          Logger.info("WORKER", `No workers left. Gracefully Exiting...`);
          process.exit();
        }

        // force kill after grace period
        Object.values(cluster.workers || {}).forEach((w) => w?.kill(signal));
        process.exit();
      }, grace).unref();

      Object.values(cluster.workers || {}).forEach((w) => {
        w?.process.kill(signal);
      });
    };
  };

  // Disconnect workers
  const disconnect = () => {
    setTimeout(() => cluster.worker?.disconnect(), 50);
  };

  if (cluster.isPrimary) {
    await master(process.pid);

    // Emitted after the worker IPC channel has disconnected. This can occur when a worker exits gracefully, is killed,
    // or is disconnected manually (such as with worker.disconnect()).
    cluster.on("disconnect", (w) => {
      Logger.info("WORKER", `The worker #${w.id} has disconnected`);
      if (!running) return;
      cluster.fork();
    });

    // Register signals to shutdown workers gracefully
    signals.forEach((signal) => {
      process.on(signal, shutdown(signal));
    });

    for (let i = 0; i < totalWorkers; i += 1) {
      cluster.fork();
    }
  } else {
    await worker(process.pid, disconnect);
  }
}
