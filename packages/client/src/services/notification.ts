import type { GetAllNotificationsResponse, MarkNotificationReadResponse } from "@votewise/api";
import type { BaseOptions, TClient } from "../utils";

import { notifications } from "@votewise/constant/routes";

export class Notification {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
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
