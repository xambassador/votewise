import type { Group } from "@votewise/prisma/client";

import { prisma } from "@votewise/prisma";

class BaseGroup {
  async isGroupExists(groupId: number) {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    return group;
  }

  async isUserAlreadyMember(userId: number, groupId: number) {
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });
    return groupMember;
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
    const user = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
        role: "ADMIN",
      },
    });
    return user;
  }

  async isGroupInvitaionExists(
    userId: number,
    groupId: number,
    type: "JOIN" | "INVITE" = "JOIN",
    status?: "PENDING" | "ACCEPTED" | "REJECTED"
  ) {
    const invitation = await await prisma.groupInvitation.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
        status,
        type,
      },
    });

    return invitation;
  }

  async isMemberExists(userId: number, groupId: number) {
    const user = await prisma.groupMember.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
        role: "MEMBER",
      },
    });

    return user;
  }
}

export default BaseGroup;
