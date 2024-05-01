import type { Request } from "express";

import { APP_SETTINGS } from "@/configs";

const getLimitAndOffset = (req: Request) => {
  const { limit: qLimit, offset: qOffset } = req.query;
  const limit = Number(qLimit) || APP_SETTINGS.API.DEFAULT_LIMIT;
  const offset = Number(qOffset) || APP_SETTINGS.API.DEFAULT_OFFSET;
  return { limit, offset };
};

export { getLimitAndOffset };
