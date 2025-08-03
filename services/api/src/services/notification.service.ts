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
    this.eventBus.on("groupJoinRequestNotification", (data) => {
      const event = new EventBuilder("groupJoinRequestNotification").setData(data).serialize(["adminId"]);
      this.sendNotificationToClient(data.adminId, event);
    });

    this.eventBus.on("groupJoinNotification", (data) => {
      const event = new EventBuilder("groupJoinNotification").setData(data).serialize(["adminId"]);
      this.sendNotificationToClient(data.adminId, event);
    });

    this.eventBus.on("groupInviteNotification", (data) => {
      const event = new EventBuilder("groupInviteNotification").setData(data).serialize();
      this.sendNotificationToClient(data.invitedUserId, event);
    });
  }

  private sendNotificationToClient(clientId: string, event: string) {
    const sockets = this.ctx.clients.get(clientId);
    if (!sockets) return;
    sockets.forEach((client) => {
      if (client.ws.readyState === Websocket.OPEN) {
        client.ws.send(event);
      }
    });
  }
}
