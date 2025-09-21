import type { NotificationContent } from "@/lib/notification-builder";
import type { Prisma } from "@votewise/prisma";
import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = Omit<Prisma.NotificationUncheckedCreateInput, "content"> & {
  content: NotificationContent;
};

export class NotificationRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const notification = await db.notification.create({ data, select: { id: true } });
      return notification;
    });
  }

  public async findByUserId(userId: string) {
    return this.execute(async () => {
      const notifications = await this.db.notification.findMany({
        where: { user_id: userId, is_read: false },
        orderBy: { created_at: "desc" },
        take: 10
      });
      return notifications;
    });
  }

  public async findById(id: string) {
    return this.execute(async () => {
      const notification = await this.db.notification.findUnique({ where: { id } });
      return notification;
    });
  }

  public async markAsRead(id: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const notification = await db.notification.update({ where: { id }, data: { is_read: true } });
      return notification;
    });
  }

  public async deleteById(id: string, tx?: TransactionCtx) {
    return this.execute(async () => {
      const db = tx ?? this.db;
      await db.notification.delete({ where: { id } });
    });
  }
}
