/**
 * @file: index.ts
 * @description: Middlewares for the application
 */
import compression from "compression";
import cors from "cors";
import type { Application } from "express";
import express, { json } from "express";
import helmet from "helmet";

import { logger } from "../utils";

const registerMiddlewares = (app: Application) => {
  logger("Registering middlewares....");
  app.use(compression());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    json({
      limit: "50mb",
    })
  );
  app.use((req, res, next) => {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      Object.freeze(req.body);
    }
    next();
  });
  logger("Middlewares registered....");
};

export { registerMiddlewares };
