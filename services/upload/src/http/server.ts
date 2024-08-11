import type { ServerConfig } from "@/config";
import type { HttpTerminator } from "http-terminator";

import http from "http";
import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";
import { createHttpTerminator } from "http-terminator";

import { AppContext } from "../context";
import * as error from "./error";
import { AppRouter } from "./router";

export class Server {
  public ctx: AppContext;
  public server?: http.Server;
  public app: express.Application;
  private terminator?: HttpTerminator;

  constructor(opts: { app: express.Application; ctx: AppContext }) {
    this.ctx = opts.ctx;
    this.app = opts.app;
    this.setupGracefulShutdown();
  }

  static async create(opts: { cfg: ServerConfig; overrides?: Partial<AppContext> }) {
    const { cfg, overrides } = opts;
    const app = express();
    const ctx = await AppContext.fromConfig(cfg, overrides);
    const router = new AppRouter({ ctx });
    app.disable("x-powered-by");
    app.set("trust proxy", true);
    app.use(chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)));
    app.use(compression());
    app.use(cors(cfg.cors));
    app.use(helmet());
    app.use(express.urlencoded({ extended: true }));
    app.use(json({ limit: cfg.blobUploadLimit }));
    app.use(router.register());
    app.use(error.withAppContext(ctx).handler);
    return new Server({ app, ctx });
  }

  public async start(): Promise<http.Server> {
    const { port } = this.ctx.config;
    http.createServer(this.app);
    const server = this.app.listen(port, () => {
      this.ctx.logger.logSync(`Votewise upload server is running on port ${port}`);
      this.terminator = createHttpTerminator({ server });
    });
    this.server = server;
    this.server.keepAliveTimeout = 61 * 1000;
    server.on("error", (err) => {
      const error = err as NodeJS.ErrnoException;
      if (error.syscall !== "listen") {
        throw err;
      }

      const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
      switch (error.code) {
        case "EACCES":
          this.ctx.logger.errorSync(`${bind} requires elevated privileges`);
          return process.exit(1);
        case "EADDRINUSE":
          this.ctx.logger.errorSync(`${bind} is already in use`);
          return process.exit(1);
        default:
          throw err;
      }
    });
    return server;
  }

  private setupGracefulShutdown() {
    process.on("SIGTERM", async () => {
      await this.shutdown();
    });
    process.on("SIGINT", async () => {
      await this.shutdown();
    });
  }

  private async shutdown() {
    this.ctx.logger.logSync("Shutting down Votewise upload server");
    try {
      await this.shutdownServer();
      this.server = undefined;
      this.ctx.logger.logSync("Votewise upload server shutdown complete");
      process.exit(0);
    } catch (err) {
      this.ctx.logger.errorSync("Error shutting down server", err);
      process.exit(1);
    }
  }

  private async shutdownServer() {
    return new Promise((resolve, reject) => {
      this.terminator
        ?.terminate()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync("Error shutting down server", err);
          reject(err);
        });
    });
  }
}
