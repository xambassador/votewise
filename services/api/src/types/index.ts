/* eslint-disable @typescript-eslint/no-namespace */
import type { envBaseSchema, TEnv } from "@votewise/env";
import type { AccessTokenPayload } from "@votewise/types";
import type { Request, Response } from "express";
import type Websocket from "ws";
import type { z } from "zod";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envBaseSchema> {}
  }
}

declare global {
  interface InMemorySession {
    ip: string;
    userAgent: string;
    aal: "aal1" | "aal2";
  }

  interface Locals {
    meta: { ip: string };
    /**
     * The session stored in redis
     */
    session: InMemorySession;
    /**
     * Parsed access token payload
     */
    payload: AccessTokenPayload;
  }

  interface Environment extends TEnv {}
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExtractControllerResponse<T extends { handle: Function }> = T["handle"] extends (
  req: Request,
  res: Response
) => Promise<infer R extends Response>
  ? R["json"] extends (body: infer _B) => Response<infer T>
    ? T
    : never
  : never;

export type SocketClient = {
  sub: string;
  ip: string;
  connectedAt: number;
  ws: Websocket;
};

export type LiveUser = { sessions: SocketClient[]; notifications: number };
