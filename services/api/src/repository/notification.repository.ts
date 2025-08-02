import type { Prisma } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

type TCreate = Prisma.NotificationCreateInput;

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
}
