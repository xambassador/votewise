import type { Request } from "express";

const getLimitAndOffset = (req: Request) => {
  const { limit: qLimit, offset: qOffset } = req.query;
  const limit = Number(qLimit) || 10;
  const offset = Number(qOffset) || 0;
  return { limit, offset };
};

export { getLimitAndOffset };
