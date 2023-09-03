import { prisma } from "@votewise/prisma";
import { StatusCodes } from "http-status-codes";

import ServerError from "@/src/classes/ServerError";
import { getPagination } from "@/src/utils";

class FollowerService {
  async getFollowersByUserId(userId: number, limit = 5, offset = 0) {
    const total = await prisma.follow.count({
      where: {
        following_id: userId,
      },
    });
    const followers = await prisma.follow.findMany({
      where: {
        following_id: userId,
      },
      select: {
        followers: {
          select: {
            username: true,
            name: true,
            id: true,
            profile_image: true,
            about: true,
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
      followers: followers.map((follower) => follower.followers),
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async getFollowingByUserId(userId: number, limit = 5, offset = 0) {
    const total = await prisma.follow.count({
      where: {
        follower_id: userId,
      },
    });
    const following = await prisma.follow.findMany({
      where: {
        follower_id: userId,
      },
      select: {
        following: {
          select: {
            username: true,
            name: true,
            id: true,
            profile_image: true,
            about: true,
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
      following: following.map((follow) => follow.following),
      meta: {
        pagination: {
          ...getPagination(total, limit, offset),
        },
      },
    };
  }

  async startFollowing(userId: number, followingId: number) {
    const isAlreadyFollowing = await prisma.follow.findFirst({
      where: {
        follower_id: userId,
        following_id: followingId,
      },
    });

    if (isAlreadyFollowing) {
      throw new ServerError(StatusCodes.BAD_REQUEST, "Already following");
    }

    const follow = await prisma.follow.create({
      data: {
        follower_id: userId,
        following_id: followingId,
      },
    });

    return follow;
  }

  async stopFollowing(userId: number, followingId: number) {
    const isAlreadyFollowing = await prisma.follow.findFirst({
      where: {
        follower_id: userId,
        following_id: followingId,
      },
    });

    if (!isAlreadyFollowing) {
      throw new ServerError(StatusCodes.BAD_REQUEST, "Not following");
    }

    const follow = await prisma.follow.delete({
      where: {
        id: isAlreadyFollowing.id,
      },
    });

    return follow;
  }
}

const followerService = new FollowerService();

export default followerService;
