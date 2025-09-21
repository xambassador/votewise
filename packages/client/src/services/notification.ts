import type { GetAllNotificationsResponse, MarkNotificationReadResponse } from "@votewise/api";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { notifications } from "@votewise/constant/routes";

type NotificationOptions = {
  client: Client | ServerClient;
};

export class Notification {
  private readonly client: Client | ServerClient;

  constructor(opts: NotificationOptions) {
    this.client = opts.client;
  }

  public async getAll() {
    const path = notifications.runtime.all("");
    const res = await this.client.get<GetAllNotificationsResponse>(path);
    return res;
  }

  public async markAsRead(notificationId: string) {
    const path = notifications.runtime.markAsRead("", notificationId);
    const res = await this.client.patch<MarkNotificationReadResponse, object>(path, {});
    return res;
  }
}

export type { GetAllNotificationsResponse, MarkNotificationReadResponse };
