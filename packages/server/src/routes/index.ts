import type { Application } from "express";

// -----------------------------------------------------------------------------------------
import Logger from "@votewise/lib/logger";
import {
  AUTH_ROUTE_V1,
  GROUPS_ROUTE_V1,
  HEALTH_ROUTE,
  ONBOARDING_ROUTE_V1,
  POST_ROUTE_V1,
  USER_ROUTE_V1,
} from "@votewise/lib/routes";

import { errorMiddleware } from "@/src/middlewares/error";
import authRouter from "@/src/routes/auth";
import groupRouter from "@/src/routes/group";
import healthCheckRouter from "@/src/routes/healthCheck";
import notFoundRouter from "@/src/routes/notFound";
import onboardingRouter from "@/src/routes/onboarding";
import postRouter from "@/src/routes/post";
import userRouter from "@/src/routes/user";

// Register routes
const registerRoutes = (app: Application) => {
  Logger.info("LIFECYCLE", `🚀 Launching Navigation....`);

  app.use(HEALTH_ROUTE, healthCheckRouter);
  app.use(AUTH_ROUTE_V1, authRouter);
  app.use(ONBOARDING_ROUTE_V1, onboardingRouter);
  app.use(USER_ROUTE_V1, userRouter);
  app.use(POST_ROUTE_V1, postRouter);
  app.use(GROUPS_ROUTE_V1, groupRouter);
  app.use("*", notFoundRouter);
  app.use(errorMiddleware);

  Logger.info("LIFECYCLE", `🚀 Launching Navigation done! Routes in position.`);
};

export { registerRoutes };
