import type { GroupMemberRole, GroupStatus } from "@votewise/prisma/client";
import type {
  GroupInvitationUpdate,
  GroupUpdate,
  NewGroup,
  NewGroupInvitation,
  NewGroupNotification
} from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

export class GroupRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];
  public readonly groupMember: GroupMemberRepository;
  public readonly groupInvitation: GroupInvitationRepository;
  public readonly groupNotifications: GroupNotificationsRepository;

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
    this.groupMember = new GroupMemberRepository(cfg);
    this.groupInvitation = new GroupInvitationRepository(cfg);
    this.groupNotifications = new GroupNotificationsRepository(cfg);
  }

  public getGroupsById(ids: string[]) {
    return this.execute(async () => {
      const groups = await this.dataLayer
        .selectFrom("Group")
        .where("id", "in", ids)
        .select(["id", "name", "about"])
        .execute();

      if (groups.length === 0) return [];

      const groupIds = groups.map((g) => g.id);

      const admins = await this.dataLayer
        .selectFrom("GroupMember as gm")
        .innerJoin("User as u", "u.id", "gm.user_id")
        .select(["gm.group_id", "u.id as user_id", "u.first_name", "u.last_name", "u.avatar_url", "u.user_name"])
        .where("gm.group_id", "in", groupIds)
        .where("gm.role", "=", "ADMIN")
        .execute();

      const adminByGroup = new Map<string, typeof admins>();
      for (const admin of admins) {
        if (!adminByGroup.has(admin.group_id)) {
          adminByGroup.set(admin.group_id, []);
        }
        adminByGroup.get(admin.group_id)!.push(admin);
      }

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        about: group.about,
        admins: (adminByGroup.get(group.id) || []).map((a) => ({
          id: a.user_id,
          first_name: a.first_name,
          last_name: a.last_name,
          avatar_url: a.avatar_url,
          user_name: a.user_name
        }))
      }));
    });
  }

  public count(params?: { status?: GroupStatus }) {
    const { status } = params || {};
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("Group")
        .$if(!!status, (qb) => qb.where("status", "=", status!))
        .select([sql<number>`count(*)`.as("count")])
        .executeTakeFirstOrThrow();
      return res.count;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const group = await this.dataLayer
        .selectFrom("Group as g")
        .leftJoin("GroupAggregates as ga", "ga.group_id", "g.id")
        .select([
          "g.id",
          "g.name",
          "g.about",
          "g.cover_image_url",
          "g.created_at",
          "g.logo_url",
          "g.status",
          "g.type",
          "g.updated_at",
          "ga.total_comments",
          "ga.total_members",
          "ga.total_posts",
          "ga.total_votes"
        ])
        .where("g.id", "=", id)
        .executeTakeFirst();

      if (!group) {
        return null;
      }

      const members = await this.dataLayer
        .selectFrom(
          this.dataLayer
            .selectFrom("GroupMember as gm")
            .innerJoin("User as u", "u.id", "gm.user_id")
            .select(["gm.user_id", "u.avatar_url", sql<number>`row_number() over (order by gm.joined_at asc)`.as("rn")])
            .where("gm.group_id", "=", id)
            .as("ranked_members")
        )
        .selectAll()
        .where("rn", "<=", 5)
        .execute();

      return {
        id: group.id,
        name: group.name,
        about: group.about,
        cover_image_url: group.cover_image_url,
        created_at: group.created_at,
        logo_url: group.logo_url,
        status: group.status,
        type: group.type,
        updated_at: group.updated_at,
        groupAggregates: {
          total_comments: group.total_comments,
          total_members: group.total_members,
          total_posts: group.total_posts,
          total_votes: group.total_votes
        },
        members: members.map((m) => ({ user_id: m.user_id, user: { avatar_url: m.avatar_url } }))
      };
    });
  }

  public getAll(props: { page: number; limit: number; status?: GroupStatus }) {
    const { page, limit, status = "OPEN" } = props;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const groups = await this.dataLayer
        .selectFrom("Group as g")
        .leftJoin("GroupMember as gm", "gm.group_id", "g.id")
        .select([
          "g.id",
          "g.name",
          "g.about",
          "g.logo_url",
          "g.created_at",
          "g.updated_at",
          "g.status",
          "g.type",
          sql<number>`count(gm.id)`.as("member_count")
        ])
        .where("g.status", "=", status)
        .groupBy("g.id")
        .orderBy("g.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (groups.length === 0) {
        return [];
      }

      const groupIds = groups.map((g) => g.id);

      const admins = await this.dataLayer
        .selectFrom("GroupMember as gm")
        .innerJoin("User as u", "u.id", "gm.user_id")
        .select(["u.id as user_id", "u.user_name", "u.first_name", "u.last_name", "gm.group_id"])
        .where("gm.group_id", "in", groupIds)
        .where("gm.role", "=", "ADMIN")
        .execute();

      const adminsByGroup = new Map<string, (typeof admins)[0]>();
      for (const admin of admins) {
        if (!adminsByGroup.has(admin.group_id)) {
          adminsByGroup.set(admin.group_id, admin);
        }
      }

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        about: group.about,
        logo_url: group.logo_url,
        created_at: group.created_at,
        updated_at: group.updated_at,
        status: group.status,
        type: group.type,
        admin: adminsByGroup.get(group.id),
        _count: { members: group.member_count }
      }));
    });
  }

  public getCountByUserId(userId: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", userId)
        .select(["total_groups"])
        .executeTakeFirstOrThrow();
      return res.total_groups;
    });
  }

  public getByUserId(userId: string, props: { page: number; limit: number }) {
    const { page, limit } = props;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const skeleton = await this.dataLayer
        .selectFrom("GroupMember")
        .where("user_id", "=", userId)
        .where("is_removed", "=", false)
        .select("group_id")
        .execute();

      if (skeleton.length === 0) {
        return [];
      }

      const ids = skeleton.map((s) => s.group_id);
      const groups = await this.dataLayer
        .selectFrom("Group as g")
        .leftJoin("GroupMember as gm", "gm.group_id", "g.id")
        .where("g.id", "in", ids)
        .select([
          "g.id",
          "g.name",
          "g.about",
          "g.logo_url",
          "g.created_at",
          "g.updated_at",
          "g.status",
          "g.type",
          sql<number>`count(gm.id)`.as("member_count")
        ])
        .groupBy("g.id")
        .orderBy("g.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (groups.length === 0) {
        return [];
      }

      const groupIds = groups.map((g) => g.id);
      const admins = await this.dataLayer
        .selectFrom("GroupMember as gm")
        .innerJoin("User as u", "u.id", "gm.user_id")
        .select(["u.id as user_id", "u.user_name", "u.first_name", "u.last_name", "gm.group_id"])
        .where("gm.group_id", "in", groupIds)
        .where("gm.role", "=", "ADMIN")
        .execute();

      const adminsByGroup = new Map<string, (typeof admins)[0]>();
      for (const admin of admins) {
        if (!adminsByGroup.has(admin.group_id)) {
          adminsByGroup.set(admin.group_id, admin);
        }
      }

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        about: group.about,
        logo_url: group.logo_url,
        created_at: group.created_at,
        updated_at: group.updated_at,
        status: group.status,
        type: group.type,
        admin: adminsByGroup.get(group.id),
        _count: { members: group.member_count }
      }));
    });
  }

  public create(data: NewGroup, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const group = await db
        .insertInto("Group")
        .values({
          id: this.dataLayer.createId(),
          about: data.about,
          name: data.name,
          type: data.type,
          status: data.status,
          cover_image_url: data.cover_image_url,
          logo_url: data.logo_url,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return group;
    });
  }

  public update(id: string, data: GroupUpdate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      await db
        .updateTable("Group")
        .set({ ...data, updated_at: new Date() })
        .where("id", "=", id)
        .execute();
    });
  }

  public getByName(name: string) {
    return this.execute(async () => {
      const group = await this.dataLayer.selectFrom("Group").where("name", "=", name).selectAll().executeTakeFirst();
      return group;
    });
  }
}

export class GroupMemberRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public addMember(groupId: string, userId: string, role: GroupMemberRole, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const member = await db
        .insertInto("GroupMember")
        .values({
          id: this.dataLayer.createId(),
          blocked: false,
          is_removed: false,
          group_id: groupId,
          user_id: userId,
          role,
          joined_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return member;
    });
  }

  public isMember(groupId: string, userId: string) {
    return this.execute(async () => {
      const member = await this.dataLayer
        .selectFrom("GroupMember")
        .where("group_id", "=", groupId)
        .where("user_id", "=", userId)
        .where("is_removed", "=", false)
        .select(["id"])
        .executeTakeFirst();
      return !!member;
    });
  }

  public getAdmin(groupId: string) {
    return this.execute(async () => {
      const admin = await this.dataLayer
        .selectFrom("GroupMember")
        .where("group_id", "=", groupId)
        .where("role", "=", "ADMIN")
        .selectAll()
        .executeTakeFirst();
      return admin;
    });
  }

  public getAdminDetails(groupId: string) {
    return this.execute(async () => {
      const admin = await this.dataLayer
        .selectFrom("GroupMember as member")
        .innerJoin("User as u", "u.id", "member.user_id")
        .where("group_id", "=", groupId)
        .where("role", "=", "ADMIN")
        .select([
          "u.id as user_id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "member.id as member_id",
          "member.blocked",
          "member.role",
          "member.group_id",
          "member.created_at",
          "member.is_removed",
          "member.joined_at",
          "member.role",
          "member.updated_at"
        ])
        .executeTakeFirst();
      if (!admin) {
        return null;
      }

      return {
        user: {
          id: admin.user_id,
          user_name: admin.user_name,
          first_name: admin.first_name,
          last_name: admin.last_name,
          avatar_url: admin.avatar_url
        },
        id: admin.member_id,
        blocked: admin.blocked,
        role: admin.role,
        group_id: admin.group_id,
        created_at: admin.created_at,
        is_removed: admin.is_removed,
        joined_at: admin.joined_at,
        updated_at: admin.updated_at
      };
    });
  }

  public whatIsMyRole(groupId: string, userId: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("GroupMember")
        .where("group_id", "=", groupId)
        .where("user_id", "=", userId)
        .select("role")
        .executeTakeFirst();
      return res;
    });
  }

  public leaveGroup(groupId: string, userId: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const member = await db
        .deleteFrom("GroupMember")
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        .where("group_id", "=", groupId)
        .where("user_id", "=", userId)
        .returningAll()
        .executeTakeFirstOrThrow();
      return member;
    });
  }

  public kick(groupId: string, userId: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const member = await db
        .updateTable("GroupMember")
        .set({ is_removed: true, updated_at: new Date() })
        .where("group_id", "=", groupId)
        .where("user_id", "=", userId)
        .returningAll()
        .executeTakeFirstOrThrow();
      return member;
    });
  }

  public getModeratingMembers(groupId: string) {
    return this.execute(async () => {
      const members = await this.dataLayer
        .selectFrom("GroupMember as member")
        .innerJoin("User as u", "u.id", "member.user_id")
        .where((eb) =>
          eb.and([eb("group_id", "=", groupId), eb("role", "in", ["MODERATOR", "ADMIN"]), eb("is_removed", "=", false)])
        )
        .select([
          "member.id",
          "member.role",
          "member.joined_at",
          "u.id as user_id",
          "u.avatar_url",
          "u.first_name",
          "u.last_name",
          "u.user_name"
        ])
        .execute();
      return members.map((m) => ({
        user: {
          id: m.user_id,
          avatar_url: m.avatar_url,
          first_name: m.first_name,
          last_name: m.last_name,
          user_name: m.user_name
        },
        id: m.id,
        role: m.role,
        joined_at: m.joined_at
      }));
    });
  }

  public getMembers(groupId: string) {
    return this.execute(async () => {
      const members = await this.dataLayer
        .selectFrom("GroupMember as member")
        .innerJoin("User as u", "u.id", "member.user_id")
        .where((eb) => eb.and([eb("group_id", "=", groupId), eb("is_removed", "=", false)]))
        .select([
          "member.id",
          "member.role",
          "member.joined_at",
          "u.id as user_id",
          "u.avatar_url",
          "u.first_name",
          "u.last_name",
          "u.user_name"
        ])
        .orderBy("u.user_name", "asc")
        .execute();
      return members.map((m) => ({
        user: {
          id: m.user_id,
          avatar_url: m.avatar_url,
          first_name: m.first_name,
          last_name: m.last_name,
          user_name: m.user_name
        },
        id: m.id,
        role: m.role,
        joined_at: m.joined_at
      }));
    });
  }
}

export class GroupInvitationRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: NewGroupInvitation, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const invitation = await db
        .insertInto("GroupInvitation")
        .values({
          ...data,
          id: this.dataLayer.createId(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return invitation;
    });
  }

  public findById(id: string) {
    return this.execute(async () =>
      this.dataLayer.selectFrom("GroupInvitation").where("id", "=", id).selectAll().executeTakeFirst()
    );
  }

  public findByUserWithGroup(userId: string, groupId: string) {
    return this.execute(async () =>
      this.dataLayer
        .selectFrom("GroupInvitation")
        .where("user_id", "=", userId)
        .where("group_id", "=", groupId)
        .selectAll()
        .executeTakeFirst()
    );
  }

  public update(id: string, data: GroupInvitationUpdate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const invitation = await db
        .updateTable("GroupInvitation")
        .set({ ...data, updated_at: new Date() })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return invitation;
    });
  }

  public getAllJointRequests(groupId: string) {
    return this.execute(async () => {
      const invitations = await this.dataLayer
        .selectFrom("GroupInvitation as invitation")
        .innerJoin("User as u", "invitation.user_id", "u.id")
        .innerJoin("Group as g", "invitation.group_id", "g.id")
        .where((eb) =>
          eb.and([
            eb("invitation.group_id", "=", groupId),
            eb("invitation.status", "=", "PENDING"),
            eb("invitation.type", "=", "JOIN")
          ])
        )
        .select([
          "g.id as group_id",
          "g.name",
          "u.id as user_id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "invitation.id",
          "invitation.sent_at",
          "invitation.status",
          "invitation.type",
          "invitation.created_at",
          "invitation.updated_at"
        ])
        .execute();

      return invitations.map((invitation) => ({
        group: {
          id: invitation.group_id,
          name: invitation.name
        },
        user: {
          id: invitation.user_id,
          user_name: invitation.user_name,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          avatar_url: invitation.avatar_url
        },
        id: invitation.id,
        sent_at: invitation.sent_at,
        status: invitation.status,
        type: invitation.type,
        created_at: invitation.created_at,
        updated_at: invitation.updated_at
      }));
    });
  }

  public findPendingJoinRequest(id: string) {
    return this.execute(async () => {
      const req = await this.dataLayer
        .selectFrom("GroupInvitation as invitation")
        .leftJoin("GroupNotification as notification", "notification.group_invitation_id", "invitation.id")
        .where((eb) =>
          eb.and([
            eb("invitation.id", "=", id),
            eb("invitation.status", "=", "PENDING"),
            eb("invitation.type", "=", "JOIN")
          ])
        )
        .selectAll(["invitation", "notification"])
        .executeTakeFirst();
      return req;
    });
  }

  public getUserGroupsJoinRequests(userId: string) {
    return this.execute(async () => {
      const groups = await this.dataLayer
        .selectFrom("GroupMember")
        .where((eb) =>
          eb.and([eb("user_id", "=", userId), eb("is_removed", "=", false), eb("role", "in", ["ADMIN", "MODERATOR"])])
        )
        .select("group_id")
        .execute();

      if (groups.length === 0) {
        return [];
      }

      const groupIds = groups.map((g) => g.group_id);

      const invitations = await this.dataLayer
        .selectFrom("GroupInvitation as invitation")
        .innerJoin("User as u", "invitation.user_id", "u.id")
        .innerJoin("Group as g", "invitation.group_id", "g.id")
        .innerJoin("GroupNotification as gn", "gn.group_invitation_id", "invitation.id")
        .where((eb) =>
          eb.and([
            eb("invitation.group_id", "in", groupIds),
            eb("invitation.status", "=", "PENDING"),
            eb("invitation.type", "=", "JOIN")
          ])
        )
        .select([
          "invitation.id",
          "invitation.created_at",
          "invitation.sent_at",
          "u.id as user_id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "g.id as group_id",
          "g.name",
          "gn.notification_id"
        ])
        .orderBy("created_at", "desc")
        .execute();

      return invitations.map((invitation) => ({
        id: invitation.id,
        created_at: invitation.created_at,
        sent_at: invitation.sent_at,
        user: {
          id: invitation.user_id,
          user_name: invitation.user_name,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          avatar_url: invitation.avatar_url
        },
        group: {
          id: invitation.group_id,
          name: invitation.name
        },
        groupNotification: { notification_id: invitation.notification_id }
      }));
    });
  }
}

export class GroupNotificationsRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: NewGroupNotification, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const notification = await db
        .insertInto("GroupNotification")
        .values(data)
        .returningAll()
        .executeTakeFirstOrThrow();
      return notification;
    });
  }
}
