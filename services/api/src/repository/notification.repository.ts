import type { NewNotification } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

export class NotificationRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: NewNotification, tx?: Tx) {
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
        .rightJoin("User", "Notification.creator_id", "User.id")
        .where((eb) => eb.and([eb("user_id", "=", userId)]))
        .select([
          "Notification.id",
          "Notification.created_at",
          "Notification.read_at",
          "Notification.source_type",
          "Notification.source_id",
          "Notification.creator_id",
          "User.first_name",
          "User.last_name",
          "User.user_name",
          "User.avatar_url"
        ])
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
        .set({ read_at: new Date(), updated_at: new Date() })
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

  public async buildNotificationFromSource<T>(tableName: string, sourceId: string) {
    const db = this.dataLayer;
    return this.execute(async () => {
      const res = await sql<T>`SELECT * FROM ${sql.table(tableName)} WHERE id = ${sourceId}`.execute(db);
      return res.rows;
    });
  }
}
