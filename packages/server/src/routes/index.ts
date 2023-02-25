/**
 * @file: index.ts
 * @description: Contains all the routes for the application and registers them
 */
import type { Application } from "express";

import { HEALTH_ROUTE, AUTH_ROUTE_V1 } from "../configs";
import authRouter from "./auth";
import healthCheckRouter from "./healthCheck";
import notFoundRouter from "./notFound";

// Register routes
const registerRoutes = (app: Application) => {
  app.use(HEALTH_ROUTE, healthCheckRouter);
  app.use(AUTH_ROUTE_V1, authRouter);
  app.use("*", notFoundRouter);
};

export { registerRoutes };
