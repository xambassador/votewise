import type { NotificationContent } from "@/lib/notification-builder";
import type { Prisma } from "@votewise/prisma";

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

  public create(data: TCreate) {
    return this.execute(async () => {
      const notification = await this.db.notification.create({
        data,
        select: { id: true }
      });
      return notification;
    });
  }

  public async findByUserId(userId: string) {
    return this.execute(async () => {
      const notifications = await this.db.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 10
      });
      return notifications;
    });
  }
}
