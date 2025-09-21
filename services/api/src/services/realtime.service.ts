import type { IncomingMessage, Server } from "http";
import type Websocket from "ws";
import type { AppContext } from "../context";
import type { LiveUser, SocketClient } from "../types";

import { WebSocketServer } from "ws";

import { EventBuilder } from "@votewise/event";

import { getAuthorizationTokenFromIncomingMessage } from "@/utils/header";

import { NotificationService } from "./notification.service";

type RealtimeOpts = {
  jwtService: AppContext["services"]["jwt"];
  cryptoService: AppContext["services"]["crypto"];
  logger: AppContext["logger"];
  env: AppContext["environment"];
};

interface WebsocketInstance extends Websocket {
  socketId: string;
  userId: string;
}

export class Realtime {
  private readonly ctx: RealtimeOpts;
  private wss: Websocket.Server | null = null;

  // We are supporting multiple sessions per user
  private clients!: Map<string, LiveUser>;

  constructor(opts: RealtimeOpts) {
    this.ctx = opts;
  }

  public init(server: Server) {
    if (this.wss) return;
    this.clients = new Map();
    this.wss = new WebSocketServer({ path: "/realtime", noServer: true });
    this.initializeServices();

    server.on("upgrade", (req, socket, head) => {
      const errorHandler = (error: Error) => {
        this.ctx.logger.error(`WebSocket upgrade error: ${error.message}`);
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        socket.destroy();
      };

      socket.on("error", errorHandler);

      if (req.url !== "/realtime") {
        socket.removeListener("error", errorHandler);
        return;
      }

      const authorized = this.authorize(req);
      if (!authorized) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const { socketId, client } = authorized;
      socket.removeListener("error", errorHandler);
      this.wss?.handleUpgrade(req, socket, head, (ws) => {
        client.ws = ws;
        (ws as WebsocketInstance).socketId = socketId;
        (ws as WebsocketInstance).userId = client.sub;
        const existingClient = this.clients.get(client.sub);
        if (!existingClient) {
          this.clients.set(client.sub, { sessions: [client], notifications: 0 });
          this.wss?.emit("connection", ws, req, socketId, client);
          return;
        }
        existingClient.sessions.push(client);
        this.clients.set(client.sub, existingClient);
        this.wss?.emit("connection", ws, req, socketId, client);
      });
    });

    this.wss.on("connection", (ws) => {
      ws.on("error", (error) => {
        this.ctx.logger.error(`WebSocket error: ${error.message}`);
      });

      ws.on("close", () => {
        const userId = (ws as WebsocketInstance).userId;
        const existingClients = this.clients.get(userId);
        if (existingClients) {
          const filterClients = existingClients.sessions.filter((client) => client.ws !== ws);
          if (filterClients.length > 0) {
            this.clients.set(userId, { ...existingClients, sessions: filterClients });
          } else {
            this.clients.delete(userId);
          }
        }
      });

      const event = new EventBuilder("connected").setData({ message: "Hola, what's up?" }).serialize();
      ws.send(event);
    });
  }

  private authorize(req: IncomingMessage) {
    const token = getAuthorizationTokenFromIncomingMessage(req, this.ctx.env.API_COOKIE_SECRET);
    if (!token) {
      return null;
    }

    const result = this.ctx.jwtService.verifyAccessToken(token);
    if (!result.success) {
      return null;
    }

    const { sub } = result.data;
    const socketId = this.ctx.cryptoService.generateUUID();
    const client: SocketClient = {
      sub,
      ip: req.socket.remoteAddress || "unknown",
      connectedAt: Date.now(),
      ws: null as unknown as Websocket
    };
    return { socketId, client };
  }

  private initializeServices() {
    new NotificationService({
      clients: this.clients,
      wss: this.wss
    });
  }
}
