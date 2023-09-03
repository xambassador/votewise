import express from "express";

import { registerMiddlewares } from "@/src/middlewares";
import { registerRoutes } from "@/src/routes";

const app = express();

registerMiddlewares(app);
registerRoutes(app);

export default app;
