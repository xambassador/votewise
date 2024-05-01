import type { Application } from "express";

import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";

export function registerMiddlewares(app: Application) {
  app.use(chrona(":date :incoming :method :url :status :response-time :remote-address"));
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
  app.use((req, _, next) => {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      Object.freeze(req.body);
    }
    next();
  });
}
