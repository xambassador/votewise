import compression from "compression";
import cors from "cors";
import type { Application } from "express";
import express, { json } from "express";
import helmet from "helmet";

import Logger from "@votewise/lib/logger";

import { prettyLogger } from "../utils/prettyLogger";

const registerMiddlewares = (app: Application) => {
  Logger.info("LIFECYCLE", `🚀 Middlewares onboarding... System checking... Destination: Calculating...`);

  app.use(prettyLogger((str) => Logger.info("HTTP", str)));
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

  Logger.info(
    "LIFECYCLE",
    `🚀 Middlewares on Board! Systems check complete. Destination: Success, with registered middlewares!`
  );
};

export { registerMiddlewares };
