/**
 * @file: index.ts
 * @description: Contains all the routes for the application and registers them
 */
import type { Application } from "express";

// -----------------------------------------------------------------------------------------
import {
  AUTH_ROUTE_V1,
  GROUPS_ROUTE_V1,
  HEALTH_ROUTE,
  ONBOARDING_ROUTE_V1,
  POST_ROUTE_V1,
  USER_ROUTE_V1,
} from "@/src/configs";
import authRouter from "@/src/routes/auth";
import groupRouter from "@/src/routes/group";
import healthCheckRouter from "@/src/routes/healthCheck";
import notFoundRouter from "@/src/routes/notFound";
import onboardingRouter from "@/src/routes/onboarding";
import postRouter from "@/src/routes/post";
import userRouter from "@/src/routes/user";
import { logger } from "@/src/utils";

// Register routes
const registerRoutes = (app: Application) => {
  logger("Registering routes...");

  app.use(HEALTH_ROUTE, healthCheckRouter);
  app.use(AUTH_ROUTE_V1, authRouter);
  app.use(ONBOARDING_ROUTE_V1, onboardingRouter);
  app.use(USER_ROUTE_V1, userRouter);
  app.use(POST_ROUTE_V1, postRouter);
  app.use(GROUPS_ROUTE_V1, groupRouter);
  app.use("*", notFoundRouter);

  logger("Routes registered...");
};

export { registerRoutes };
