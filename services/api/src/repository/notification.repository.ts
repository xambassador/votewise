import type { NotificationContent } from "@/lib/notification-builder";
import type { NewNotification } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = Omit<NewNotification, "content"> & {
  content: NotificationContent;
};

export class NotificationRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const notification = await db
        .insertInto("Notification")
        .values({ ...data, id: this.dataLayer.createId(), created_at: new Date(), updated_at: new Date() })
        .returningAll()
        .executeTakeFirstOrThrow();
      return notification;
    });
  }

  public async findByUserId(userId: string) {
    return this.execute(async () => {
      const notifications = await this.dataLayer
        .selectFrom("Notification")
        .where((eb) => eb.and([eb("user_id", "=", userId), eb("is_read", "=", false)]))
        .selectAll()
        .orderBy("created_at", "desc")
        .limit(10)
        .execute();
      return notifications;
    });
  }

  public async findById(id: string) {
    return this.execute(async () => {
      const notification = await this.dataLayer
        .selectFrom("Notification")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst();
      return notification;
    });
  }

  public async markAsRead(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const notification = await db
        .updateTable("Notification")
        .set({ is_read: true })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return notification;
    });
  }

  public async deleteById(id: string, tx?: Tx) {
    const db = (tx ?? this.dataLayer) as Tx;
    return this.execute(async () => {
      db.deleteFrom("Notification").where("id", "=", id).execute();
    });
  }
}
