import type { Application } from "express";

import { Router } from "express";

import { error } from "@/http/middlewares/error";

const router = Router();

export function registerV1Routes(app: Application) {
  app.use("/api/v1", router);
  app.use(error);
}
