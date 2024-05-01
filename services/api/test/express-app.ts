import { registerMiddlewares } from "@/src/middlewares";
import { registerRoutes } from "@/src/routes";
import express from "express";

const app = express();

registerMiddlewares(app);
registerRoutes(app);

export default app;
