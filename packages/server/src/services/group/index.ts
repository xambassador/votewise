import type { CreateGroupPayload, UpdateGroupDetailsPayload } from "@votewise/types";

import { StatusCodes } from "http-status-codes";

import { prisma } from "@votewise/prisma";

import ServerError from "@/src/classes/ServerError";
import { getPagination } from "@/src/utils";
import { validateCreateGroupPayload } from "@/src/zodValidation/group";

import BaseGroup from "./Base";

class GroupService extends BaseGroup {
  validateCreateGroupPayload(payload: CreateGroupPayload) {
    return validateCreateGroupPayload(payload);
  }

  async createGroup(userId: number, payload: CreateGroupPayload) {
    const group = await prisma.group.create({
      data: {
        name: payload.name,
        about: payload.description,
        status: payload.status,
        type: payload.type,
        join_through_request: payload.joinThroghInvite,
      },
    });

    await prisma.groupMember.create({
      data: {
        user_id: userId,
        role: "ADMIN",
        group_id: group.id,
        joined_at: new Date(),
      },
    });

    return group;
  }

  async updateGroupDetails(userId: number, groupId: number, payload: UpdateGroupDetailsPayload) {
    const isGroupExist = await this.isGroupExists(groupId);
    if (!isGroupExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }

    const isAdmin = await this.isUserAdmin(userId, groupId);
    if (!isAdmin) {
      throw new ServerError(StatusCodes.FORBIDDEN, "You are not an admin of this group");
    }

    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        about: payload.description,
        name: payload.name,
        join_through_request: payload.joinThroghInvite,
        status: payload.status,
        type: payload.type,
      },
    });

    return group;
  }

  async joinGroup(userId: number, groupId: number) {
    const group = await this.isGroupExists(groupId);
    if (!group) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }

    const isUserMember = await this.isUserAlreadyMember(userId, groupId);
    if (isUserMember) {
      throw new ServerError(StatusCodes.BAD_REQUEST, "You are already a member of this group");
    }

    // Check if user is retrying to join the group if it's request is pending
    const request = await this.isGroupInvitaionExists(userId, groupId, "JOIN", "PENDING");

    if (request) {
      throw new ServerError(StatusCodes.BAD_REQUEST, "You have already sent a request to join this group");
    }

    const status = this.getInviteStatus(group) as "ACCEPTED" | "PENDING" | "REJECTED";
    const promises = [];

    if (group.type === "PRIVATE" || (group.type === "PUBLIC" && group.join_through_request)) {
      // Creating only invitation. User will be added to group when admin accepts the request
      promises.push(this.createGroupInvitationPromise(groupId, userId, status, "JOIN"));
    } else {
      // In case of public group with open join, user will be added to group directly
      // Adding entry to invitation table. The reason is if admin change the group type to private or join through request to true,
      // then we can have a record of all the users who joined the group before the change
      promises.push(this.createGroupMemberPromise(groupId, userId));
      promises.push(this.createGroupInvitationPromise(groupId, userId, status, "JOIN"));
    }

    // TODO: Send notification to group admin
    await prisma.$transaction(promises);
    Promise.resolve();
  }

  async getGroups(limit = 5, offset = 0) {
    const total = await prisma.group.count();
    const groups = await prisma.group.findMany({
      take: limit,
      skip: offset,
    });
    return {
      groups,
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async getRequests(userId: number, groupId?: number, limit = 5, offset = 0) {
    const myGroups = await prisma.groupMember.findMany({
      where: {
        user_id: userId,
        role: "ADMIN",
      },
    });

    if (!myGroups.length) {
      throw new ServerError(StatusCodes.NOT_FOUND, "You have no groups");
    }

    let groupIds;
    if (groupId) {
      const isGroupExists = await this.isGroupExists(groupId);
      if (!isGroupExists) {
        throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
      }
      const isUserAdmin = await this.isUserAdmin(userId, groupId);
      if (!isUserAdmin) {
        throw new ServerError(StatusCodes.FORBIDDEN, "You are not an admin of this group");
      }
      groupIds = [groupId];
    } else {
      groupIds = myGroups.map((group) => group.group_id);
    }

    const total = await prisma.groupInvitation.count({
      where: {
        group_id: {
          in: groupIds,
        },
        status: "PENDING",
      },
    });
    const data = await prisma.groupInvitation.findMany({
      where: {
        group_id: {
          in: groupIds,
        },
        status: "PENDING",
      },
      select: {
        id: true,
        sent_at: true,
        status: true,
        type: true,
        user: {
          select: {
            username: true,
            name: true,
            profile_image: true,
            id: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            status: true,
            about: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });
    return {
      requests: data,
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async acceptOrRejectRequest(
    userId: number,
    groupId: number,
    requestedUserId: number,
    action: "ACCEPT" | "REJECT"
  ) {
    // TODO: Send notification to user on request accept
    const isGroupExist = await this.isGroupExists(groupId);
    if (!isGroupExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }
    const isAdmin = await this.isUserAdmin(userId, groupId);
    if (!isAdmin) {
      throw new ServerError(StatusCodes.FORBIDDEN, "You are not an admin of this group");
    }

    const isRequestExist = await this.isGroupInvitaionExists(requestedUserId, groupId, "JOIN", "PENDING");
    if (!isRequestExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Request not found");
    }
    const groupType = isGroupExist.type;
    const isJoinThroughRequest = isGroupExist.join_through_request;

    if (action === "ACCEPT") {
      if (groupType === "PRIVATE" || isJoinThroughRequest) {
        const promises = [
          this.createGroupInvitationUpdatePromise(isRequestExist.id, { status: "ACCEPTED" }),
          this.createGroupMemberPromise(groupId, requestedUserId),
        ];
        await prisma.$transaction(promises);
      } else {
        await this.createGroupInvitationUpdatePromise(isRequestExist.id, { status: "ACCEPTED" });
      }
    } else {
      await this.createGroupInvitationUpdatePromise(isRequestExist.id, { status: "REJECTED" });
    }
    Promise.resolve();
  }

  async getAllGroupsByUserId(userId: number, limit = 5, offset = 0, created = true, joined = true) {
    const roles = [];
    if (created) {
      roles.push("ADMIN");
    }

    if (joined) {
      roles.push("MEMBER");
    }

    if (!created && !joined) {
      roles.push("ADMIN", "MEMBER", "MODERATOR");
    }

    const total = await prisma.groupMember.count({
      where: {
        user_id: userId,
        role: {
          in: roles as ["ADMIN", "MEMBER", "MODERATOR"],
        },
      },
    });

    const groups = await prisma.groupMember.findMany({
      where: {
        user_id: userId,
        role: {
          in: roles as ["ADMIN", "MEMBER", "MODERATOR"],
        },
      },
      select: {
        group_id: true,
        user_id: true,
        joined_at: true,
        role: true,
        group: {
          select: {
            name: true,
            id: true,
            about: true,
            type: true,
            status: true,
            join_through_request: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    return {
      groups,
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async getRequestedGroupsByUserId(userId: number, limit = 5, offset = 0, pending = true, rejected = true) {
    const status = [];
    if (pending) {
      status.push("PENDING");
    }

    if (rejected) {
      status.push("REJECTED");
    }

    if (!pending && !rejected) {
      status.push("PENDING", "REJECTED");
    }

    const groups = await prisma.groupInvitation.findMany({
      where: {
        user_id: userId,
        status: {
          in: status as ["PENDING", "REJECTED"],
        },
      },
      select: {
        status: true,
        sent_at: true,
        id: true,
        type: true,
        updated_at: true,
        group: {
          select: {
            name: true,
            id: true,
            about: true,
            type: true,
            status: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        updated_at: "desc",
      },
    });
    const total = await prisma.groupInvitation.count({
      where: {
        user_id: userId,
        status: {
          in: status as ["PENDING", "REJECTED"],
        },
      },
    });

    return {
      groups,
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async acceptOrRejectGroupInvitation(groupId: number, userId: number, action: "ACCEPT" | "REJECT") {
    const isGroupExists = await this.isGroupExists(groupId);
    if (!isGroupExists) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }
    const isRequestExist = await this.isGroupInvitaionExists(userId, groupId, "INVITE");
    if (!isRequestExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Request not found");
    }
    if (action === "ACCEPT") {
      const promises = [
        this.createGroupInvitationUpdatePromise(isRequestExist.id, { status: "ACCEPTED" }),
        this.createGroupMemberPromise(groupId, userId),
      ];
      await prisma.$transaction(promises);
    } else {
      await this.createGroupInvitationUpdatePromise(isRequestExist.id, { status: "REJECTED" });
    }
    Promise.resolve();
  }

  async leaveGroup(userId: number, groupId: number) {
    const isGroupExists = await this.isGroupExists(groupId);
    if (!isGroupExists) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }
    const isMemberExist = await this.isMemberExists(userId, groupId);
    if (!isMemberExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "User is not a member of this group");
    }
    await prisma.groupMember.delete({
      where: {
        id: isMemberExist.id,
      },
    });
    Promise.resolve();
  }

  async removeMemberFromGroup(userId: number, groupId: number, removingUserId: number) {
    const isGroupExists = await this.isGroupExists(groupId);
    if (!isGroupExists) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }
    const isMemberExist = await this.isMemberExists(removingUserId, groupId);
    if (!isMemberExist) {
      throw new ServerError(StatusCodes.NOT_FOUND, "User is not a member of this group");
    }
    const isUserAdmin = await this.isUserAdmin(userId, groupId);
    if (!isUserAdmin) {
      throw new ServerError(StatusCodes.FORBIDDEN, "You are not an admin of this group");
    }
    await prisma.groupMember.update({
      where: {
        id: isMemberExist.id,
      },
      data: {
        is_removed: true,
      },
    });
    Promise.resolve();
  }

  async getGroupMembers(userId: number, groupId: number, limit = 5, offset = 0) {
    const isGroupExists = await this.isGroupExists(groupId);
    if (!isGroupExists) {
      throw new ServerError(StatusCodes.NOT_FOUND, "Group not found");
    }

    const isMemberExists = await this.isMemberExists(userId, groupId);
    if (!isMemberExists) {
      throw new ServerError(StatusCodes.NOT_FOUND, "User is not a member of this group");
    }

    const total = await prisma.groupMember.count({
      where: {
        group_id: groupId,
        is_removed: false,
        user_id: {
          not: userId,
        },
      },
    });

    const members = await prisma.groupMember.findMany({
      where: {
        group_id: groupId,
        is_removed: false,
        user_id: {
          not: userId,
        },
      },
      select: {
        id: true,
        blocked: true,
        is_removed: true,
        joined_at: true,
        role: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profile_image: true,
            about: true,
            location: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        updated_at: "desc",
      },
    });

    return {
      members,
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }
}

const groupService = new GroupService();
export default groupService;
