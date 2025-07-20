import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

export class GroupRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public getGroupsById(ids: string[]) {
    return this.execute(async () => {
      const groups = await this.db.group.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          about: true,
          members: {
            where: {
              role: "ADMIN"
            },
            select: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  avatar_url: true,
                  user_name: true
                }
              }
            }
          }
        }
      });
      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        about: group.about,
        admins: group.members.map((member) => ({
          id: member.user.id,
          first_name: member.user.first_name,
          last_name: member.user.last_name,
          avatar_url: member.user.avatar_url,
          user_name: member.user.user_name
        }))
      }));
    });
  }

  public count() {
    return this.execute(async () => this.db.group.count());
  }

  public getAll(props: { page: number; limit: number }) {
    const { page, limit } = props;
    const offset = (page - 1) * limit;
    return this.execute(async () =>
      this.db.group.findMany({
        select: {
          id: true,
          name: true,
          created_at: true,
          updated_at: true,
          status: true,
          type: true,
          members: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  user_name: true,
                  first_name: true,
                  last_name: true,
                  avatar_url: true
                }
              }
            },
            take: 5
          },
          _count: { select: { members: true } }
        },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit
      })
    );
  }
}
