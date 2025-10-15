import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

export class SearchRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public searchUsers(query: string) {
    return this.execute(async () => {
      const users = await this.dataLayer
        .selectFrom("User")
        .select([
          "id",
          "user_name",
          "first_name",
          "last_name",
          "about",
          "avatar_url",
          "created_at",
          "updated_at",
          sql<number>`similarity(user_name, ${query})`.as("similarity")
        ])
        .where(() => sql`user_name % ${query}`)
        .orderBy("similarity", "desc")
        .execute();
      return users;
    });
  }

  public searchGroups(query: string) {
    return this.execute(async () => {
      const groups = await this.dataLayer
        .selectFrom("Group")
        .select([
          "id",
          "name",
          "about",
          "status",
          "type",
          "logo_url",
          "created_at",
          "updated_at",
          sql<number>`similarity(name, ${query})`.as("similarity")
        ])
        .where(() => sql`name % ${query}`)
        .orderBy("similarity", "desc")
        .execute();
      return groups;
    });
  }
}
