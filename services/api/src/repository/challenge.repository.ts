import type { NewChallenge } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

/* ----------------------------------------------------------------------------------------------- */

export class ChallengeRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: NewChallenge, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const challenge = await db
        .insertInto("Challenge")
        .values({ ...data, id: this.dataLayer.createId() })
        .returningAll()
        .executeTakeFirstOrThrow();
      return challenge;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const challenge = await this.dataLayer
        .selectFrom("Challenge")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst();
      return challenge;
    });
  }

  public verifyChallenge(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const challenge = await db
        .updateTable("Challenge")
        .set({ verified_at: sql`NOW()` })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return challenge;
    });
  }
}
