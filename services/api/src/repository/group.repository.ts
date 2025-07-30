import type { Prisma } from "@votewise/prisma";
import type { GroupMemberRole, GroupStatus } from "@votewise/prisma/client";

import { BaseRepository } from "./base.repository";

type CreateGroup = Prisma.GroupCreateInput;

export class GroupRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];
  public readonly groupMember: GroupMemberRepository;

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
    this.groupMember = new GroupMemberRepository(cfg);
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

  public count(params?: { status?: GroupStatus }) {
    const { status } = params || {};
    return this.execute(async () => this.db.group.count({ where: { status } }));
  }

  public findById(id: string) {
    return this.execute(async () => {
      const group = await this.db.group.findUnique({ where: { id } });
      return group;
    });
  }

  public getAll(props: { page: number; limit: number; status?: GroupStatus }) {
    const { page, limit, status = "OPEN" } = props;
    const offset = (page - 1) * limit;
    return this.execute(async () =>
      this.db.group.findMany({
        select: {
          id: true,
          name: true,
          about: true,
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
        where: { status },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit
      })
    );
  }

  public getCountByUserId(userId: string) {
    return this.execute(async () => {
      const count = await this.db.group.count({
        where: { members: { some: { user_id: userId } } }
      });
      return count;
    });
  }

  public getByUserId(userId: string, props: { page: number; limit: number }) {
    const { page, limit } = props;
    const offset = (page - 1) * limit;
    return this.execute(() =>
      this.db.group.findMany({
        where: { members: { some: { user_id: userId } } },
        select: {
          id: true,
          name: true,
          about: true,
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
            }
          },
          _count: { select: { members: true } }
        },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit
      })
    );
  }

  public create(data: CreateGroup) {
    return this.execute(async () => {
      const group = await this.db.group.create({
        data: {
          about: data.about,
          name: data.name,
          type: data.type,
          status: data.status
        }
      });
      return group;
    });
  }
}

export class GroupMemberRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public addMember(groupId: string, userId: string, role: GroupMemberRole) {
    return this.execute(async () => {
      const member = await this.db.groupMember.create({
        data: { group_id: groupId, user_id: userId, role }
      });
      return member;
    });
  }

  public isMember(groupId: string, userId: string) {
    return this.execute(async () => {
      // @todo: Replace this with findUnique after schema migration
      const member = await this.db.groupMember.findFirst({
        where: { group_id: groupId, user_id: userId },
        select: { id: true }
      });
      return !!member;
    });
  }
}
