import type { SocketClient } from "@/types";

import Websocket from "ws";

import { EventBuilder } from "@votewise/event";

import { EventBus } from "@/lib/event-bus";

type ServiceOptions = {
  wss: Websocket.Server | null;
  clients: Map<string, SocketClient[]>;
};

export class NotificationService {
  private readonly ctx: ServiceOptions;
  private readonly eventBus: EventBus;

  constructor(opts: ServiceOptions) {
    this.ctx = opts;
    this.eventBus = EventBus.create();
    this.listenForGroupEvents();
  }

  private listenForGroupEvents() {
    this.eventBus.on("groupJoinRequest", (data) => {
      const event = new EventBuilder("groupJoinRequest").setData(data).serialize(["adminId"]);
      const sockets = this.ctx.clients.get(data.adminId);
      if (!sockets) return;
      sockets.forEach((client) => {
        if (client.ws.readyState === Websocket.OPEN) {
          client.ws.send(
            JSON.stringify({
              type: "NOTIFICATION_GROUP_JOIN_REQUEST",
              data: event
            })
          );
        }
      });
    });
  }
}
