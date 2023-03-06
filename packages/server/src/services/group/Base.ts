import { prisma } from "@votewise/prisma";
import type { Group } from "@votewise/prisma/client";

import { getErrorReason } from "@/src/utils";

class BaseGroup {
  async isGroupExists(groupId: number) {
    try {
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
        },
      });
      return group;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while checking for group existence";
      throw new Error(msg);
    }
  }

  async isUserAlreadyMember(userId: number, groupId: number) {
    try {
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          user_id: userId,
          group_id: groupId,
        },
      });
      return groupMember;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while checking for group existence";
      throw new Error(msg);
    }
  }

  getInviteStatus(group: Group) {
    let status = "ACCEPTED";
    if (group.type === "PRIVATE" || (group.type === "PUBLIC" && group.join_through_request)) {
      status = "PENDING";
    }
    return status;
  }

  createGroupInvitationPromise(
    groupId: number,
    userId: number,
    status: "ACCEPTED" | "PENDING" | "REJECTED",
    type: "JOIN" | "INVITE"
  ) {
    return prisma.groupInvitation.create({
      data: {
        status,
        type,
        group_id: groupId,
        user_id: userId,
        sent_at: new Date(),
      },
    });
  }

  createGroupMemberPromise(groupId: number, userId: number) {
    return prisma.groupMember.create({
      data: {
        user_id: userId,
        group_id: groupId,
        joined_at: new Date(),
      },
    });
  }

  createGroupInvitationUpdatePromise(id: number, data: { status: "ACCEPTED" | "PENDING" | "REJECTED" }) {
    return prisma.groupInvitation.update({
      where: {
        id,
      },
      data,
    });
  }

  async isUserAdmin(userId: number, groupId: number) {
    try {
      const user = await prisma.groupMember.findFirst({
        where: {
          user_id: userId,
          group_id: groupId,
          role: "ADMIN",
        },
      });
      return user;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while checking for user admin";
      throw new Error(msg);
    }
  }

  async isGroupInvitaionExists(
    userId: number,
    groupId: number,
    type: "JOIN" | "INVITE" = "JOIN",
    status?: "PENDING" | "ACCEPTED" | "REJECTED"
  ) {
    try {
      const invitation = await await prisma.groupInvitation.findFirst({
        where: {
          user_id: userId,
          group_id: groupId,
          status,
          type,
        },
      });

      return invitation;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while checking for group invitation request exists or not";
      throw new Error(msg);
    }
  }

  async isMemberExists(userId: number, groupId: number) {
    try {
      const user = await prisma.groupMember.findFirst({
        where: {
          user_id: userId,
          group_id: groupId,
          role: "MEMBER",
        },
      });

      return user;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while checking for user is memeber of group or not";
      throw new Error(msg);
    }
  }
}

export default BaseGroup;
