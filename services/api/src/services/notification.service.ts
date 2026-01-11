import type { LiveUser } from "@/types";

import Websocket from "ws";

import { EventBuilder } from "@votewise/event";

import { EventBus } from "@/lib/event-bus";

type ServiceOptions = {
  wss: Websocket.Server | null;
  clients: Map<string, LiveUser>;
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
      const event = new EventBuilder("groupJoinRequestNotification").setData(data).serialize(["admin_id"]);
      this.sendNotificationToClient(data.admin_id, event);
    });

    this.eventBus.on("groupJoinNotification", (data) => {
      const event = new EventBuilder("groupJoinNotification").setData(data).serialize(["admin_id"]);
      this.sendNotificationToClient(data.admin_id, event);
    });

    this.eventBus.on("groupInviteNotification", (data) => {
      const event = new EventBuilder("groupInviteNotification").setData(data).serialize();
      this.sendNotificationToClient(data.invited_user_id, event);
    });

    this.eventBus.on("notificationCount", (data) => {
      const event = new EventBuilder("notificationCount").setData(data).serialize();
      this.sendNotificationToClient(data.user_id, event);
    });
  }

  private sendNotificationToClient(clientId: string, event: string) {
    const sockets = this.ctx.clients.get(clientId);
    if (!sockets) return;
    const totalNotifications = sockets.notifications + 1;
    const countEvent = new EventBuilder("notificationCount")
      .setData({ user_id: clientId, count: totalNotifications })
      .serialize();
    sockets.sessions.forEach((client) => {
      if (client.ws.readyState === Websocket.OPEN) {
        client.ws.send(countEvent);
        client.ws.send(event);
      }
    });
    sockets.notifications = totalNotifications;
  }
}
