import lodash from "lodash";

import { prisma } from "@votewise/prisma";
import type { AcceptOrRejectFriendRequestPayload } from "@votewise/types";

import {
  ALREADY_FRIENDS_MSG,
  ERROR_ACCEPTING_FRIEND_REQUEST,
  ERROR_ADDING_FRIEND,
  ERROR_FETCHING_FRIENDS,
  ERROR_FETCHING_FRIEND_REQUESTS,
  ERROR_REJECTING_FRIEND_REQUEST,
  FRIEND_REQUEST_NOT_FOUND_MSG,
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_MSG,
  getErrorReason,
  getPagination,
} from "@/src/utils";
import { validateAcceptOrRejectFriendRequestPayload } from "@/src/zodValidation";

class FriendsService {
  async getFriends(userId: number, limit = 5, offset = 0) {
    try {
      const totalFriends = await prisma.friend.count({
        where: {
          OR: [
            {
              user_id: userId,
            },
            {
              friend_id: userId,
            },
          ],
          type: "FRIENDS",
        },
      });
      const friends = await prisma.friend.findMany({
        where: {
          OR: [
            {
              user_id: userId,
            },
            {
              friend_id: userId,
            },
          ],
          type: "FRIENDS",
        },
        select: {
          id: true,
          type: true,
          updated_at: true,
          friend: {
            select: {
              name: true,
              profile_image: true,
              about: true,
              location: true,
              username: true,
              id: true,
            },
          },
          user: {
            select: {
              name: true,
              profile_image: true,
              about: true,
              location: true,
              username: true,
              id: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });
      const generalizedFriends = lodash.map(friends, (friend) => {
        if (friend.friend.id === userId) {
          const f = { ...friend.user };
          return {
            id: friend.id,
            type: friend.type,
            updated_at: friend.updated_at,
            friend_id: f.id,
            name: f.name,
            username: f.username,
            location: f.location,
            about: f.about,
            profile_image: f.profile_image,
          };
        }
        return {
          id: friend.id,
          type: friend.type,
          updated_at: friend.updated_at,
          friend_id: friend.friend.id,
          name: friend.friend.name,
          username: friend.friend.username,
          location: friend.friend.location,
          about: friend.friend.about,
          profile_image: friend.friend.profile_image,
        };
      });
      return {
        friends: generalizedFriends,
        meta: {
          pagination: {
            ...getPagination(totalFriends, limit, offset),
          },
        },
      };
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_FETCHING_FRIENDS;
      throw new Error(msg);
    }
  }

  async addFriend(userId: number, friendId: number) {
    // userId: currently logged in user
    // friendId: user who is being added as a friend (current user is sending a friend request to this user)
    try {
      // 10 -> 20 : User id 10 is sending friend request to user id 20
      // If there is an entry with user_id 20 and friend_id 10, then it means that user 20 has already sent a friend request to user 10
      // or they are already friends
      const isFriend = await prisma.friend.findFirst({
        where: {
          OR: [
            {
              user_id: friendId,
              friend_id: userId,
            },
            {
              user_id: userId,
              friend_id: friendId,
            },
          ],
        },
      });

      if (isFriend && isFriend.type === "FRIENDS") {
        throw new Error(ALREADY_FRIENDS_MSG);
      }

      if (isFriend && isFriend.type === "PENDING_USER_TO_FRIEND_REQUEST") {
        throw new Error("Friend request already sent");
      }

      const friend = await prisma.friend.create({
        data: {
          user_id: userId,
          friend_id: friendId,
          type: "PENDING_USER_TO_FRIEND_REQUEST",
        },
      });
      return friend;
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_ADDING_FRIEND;
      throw new Error(msg);
    }
  }

  validateAcceptOrRejectFriendRequestPayload(payload: AcceptOrRejectFriendRequestPayload) {
    return validateAcceptOrRejectFriendRequestPayload(payload);
  }

  async acceptOrRejectFriendRequest(
    userId: number,
    friendId: number,
    requestId: number,
    type: "ACCEPT" | "REJECT"
  ) {
    try {
      if (type === "ACCEPT") {
        return await this.acceptFriendRequest(userId, friendId, requestId);
      }
      return await this.rejectFriendRequest(userId, friendId, requestId);
    } catch (err) {
      const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
      throw new Error(msg);
    }
  }

  async acceptFriendRequest(userId: number, friendId: number, requestId: number) {
    // userId: currently logged in user
    // friendId: user who sent the friend request
    // requestId: id of the friend request
    try {
      // 10 -> 20 : User id 10 is sending friend request to user id 20
      // From 20, we are accepting the friend request
      // So, entry will look like this
      // user_id: 10
      // friend_id: 20
      const request = await prisma.friend.findUnique({
        where: {
          id: requestId,
        },
      });

      if (!request) {
        throw new Error(FRIEND_REQUEST_NOT_FOUND_MSG);
      }

      // I am accepting the friend request, so I am the friend of the user who sent the request
      // So, I should be the friend_id and the user who sent the request should be the user_id
      if (request.friend_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      if (request.user_id !== friendId) {
        throw new Error(FRIEND_REQUEST_NOT_FOUND_MSG);
      }

      const friend = await prisma.friend.update({
        where: {
          id: requestId,
        },
        data: {
          type: "FRIENDS",
        },
      });

      return friend;
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_ACCEPTING_FRIEND_REQUEST;
      throw new Error(msg);
    }
  }

  async rejectFriendRequest(userId: number, friendId: number, requestId: number) {
    try {
      const request = await prisma.friend.findUnique({
        where: {
          id: requestId,
        },
      });

      if (!request) {
        throw new Error(FRIEND_REQUEST_NOT_FOUND_MSG);
      }

      // I am rejecting the friend request, so I am the friend of the user who sent the request
      // So, I should be the friend_id and the user who sent the request should be the user_id
      if (request.friend_id !== userId) {
        throw new Error(UNAUTHORIZED_MSG);
      }

      if (request.user_id !== friendId) {
        throw new Error(FRIEND_REQUEST_NOT_FOUND_MSG);
      }

      const friend = await prisma.friend.delete({
        where: {
          id: requestId,
        },
      });

      return friend;
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_REJECTING_FRIEND_REQUEST;
      throw new Error(msg);
    }
  }

  async getFriendRequests(userId: number, limit = 5, offset = 0) {
    try {
      const totalFriendRequests = await prisma.friend.count({
        where: {
          friend_id: userId,
          type: {
            not: "FRIENDS",
          },
        },
      });
      const friendRequests = await prisma.friend.findMany({
        where: {
          friend_id: userId,
          type: {
            not: "FRIENDS",
          },
        },
        select: {
          id: true,
          user: {
            select: {
              username: true,
              id: true,
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
        requests: friendRequests,
        meta: {
          pagination: {
            ...getPagination(totalFriendRequests, limit, offset),
          },
        },
      };
    } catch (err) {
      const msg = getErrorReason(err) || ERROR_FETCHING_FRIEND_REQUESTS;
      throw new Error(msg);
    }
  }
}

const friendsService = new FriendsService();

export default friendsService;
