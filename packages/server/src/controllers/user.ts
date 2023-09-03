import type { PostStatus } from "@prisma/client";
import type {
  AcceptOrRejectFriendRequestPayload,
  ChangeStatusPayload,
  CreatePostPayload,
  UpdatePostPayload,
} from "@votewise/types";
import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import ServerError from "@/src/classes/ServerError";
import Success from "@/src/classes/Success";
import ValidationError from "@/src/classes/ValidationError";
import FollowerService from "@/src/services/follower";
import FriendService from "@/src/services/friends";
import GroupService from "@/src/services/group";
import PostService from "@/src/services/posts";
import UserService from "@/src/services/user";
import {
  COMMENT_FETCHED_SUCCESSFULLY_MSG,
  FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG,
  FRIENDS_FETCHED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG,
  FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG,
  getLimitAndOffset,
  INVALID_FRIEND_ID,
  INVALID_POST_ID_MSG,
  POSTS_FETCHED_SUCCESSFULLY_MSG,
  POST_CREATED_SUCCESSFULLY_MSG,
  POST_DELETED_SUCCESSFULLY_MSG,
  POST_STATUS_CHANGED_SUCCESSFULLY_MSG,
  POST_UPDATE_SUCCESSFULLY_MSG,
  USERNAME_ALREADY_TAKEN_MSG,
  USERNAME_AVAIALABLE_MSG,
  USERNAME_REQUIRED_MSG,
  USER_DETAILS_FETCHED_SUCCESSFULLY_MSG,
} from "@/src/utils";
/* ----------------------------------------------------------------------------------------------- */

/** Is username available */
export const checkUsernameAvailability = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.query as { username: string };

  if (!username) {
    return next(new ValidationError(USERNAME_REQUIRED_MSG));
  }

  try {
    const user = await UserService.isUsernameExists(username);

    if (user) throw new ServerError(StatusCodes.BAD_REQUEST, USERNAME_ALREADY_TAKEN_MSG);

    const response = new Success(USERNAME_AVAIALABLE_MSG, {
      message: `Username ${username} is available`,
    });

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get current logged in user details */
export const getMyDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  try {
    const data = await UserService.getMyDetails(user.id);
    const response = new Success(USER_DETAILS_FETCHED_SUCCESSFULLY_MSG, {
      user: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Create a new post */
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CreatePostPayload;

  const validation = PostService.validatePostPayload(payload);

  if (!validation.success) {
    return next(new ValidationError(validation.message));
  }

  const { user } = req.session;

  try {
    const data = await PostService.createPost(payload, user.id);
    const response = new Success(POST_CREATED_SUCCESSFULLY_MSG, {
      post: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get current logged in user posts */
export const getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { status, orderBy } = req.query;

  type Status = "open" | "closed" | "archived" | "inprogress";
  type OrderBy = "asc" | "desc";

  if (status && !["open", "closed", "archived", "inprogress"].includes(status as Status)) {
    return next(new ValidationError("Invalid status"));
  }

  let mappedStatus: PostStatus = "OPEN";
  const order = orderBy ? (orderBy as OrderBy) : "asc";
  switch (status) {
    case "open":
      mappedStatus = "OPEN";
      break;
    case "closed":
      mappedStatus = "CLOSED";
      break;
    case "archived":
      mappedStatus = "ARCHIVED";
      break;
    case "inprogress":
      mappedStatus = "INPROGRESS";
      break;
    default:
      mappedStatus = "OPEN";
  }

  try {
    const data = await PostService.getPostsByUserId(user.id, limit, offset, mappedStatus, order);
    const response = new Success(POSTS_FETCHED_SUCCESSFULLY_MSG, {
      posts: data.posts,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Update current logged in user post */
export const updateMyPost = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as UpdatePostPayload;
  const { postId } = req.params;

  const validation = PostService.validatePostPayload(payload);

  if (!validation.success) {
    return next(new ValidationError(validation.message));
  }

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.updatePost(Number(postId), user.id, payload);
    const response = new Success(POST_UPDATE_SUCCESSFULLY_MSG, {
      post: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Delete current logged in user post */
export const deleteMyPost = async (req: Request, res: Response, next: NextFunction) => {
  const { postId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  const { user } = req.session;

  try {
    await PostService.deleteMyPost(Number(postId), user.id);
    const response = new Success(POST_DELETED_SUCCESSFULLY_MSG, {
      message: POST_DELETED_SUCCESSFULLY_MSG,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Change status of a post */
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as ChangeStatusPayload;
  const { postId } = req.params;

  if (!postId) {
    return next(new ValidationError(INVALID_POST_ID_MSG));
  }

  const { user } = req.session;

  try {
    const data = await PostService.changeStatus(Number(postId), payload, user.id);
    const response = new Success(POST_STATUS_CHANGED_SUCCESSFULLY_MSG, {
      post: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get current logged in user comments */
export const getMyComments = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { orderBy, status } = req.query;
  const { user } = req.session;
  const defaulOrderBy = (orderBy || "desc") as "asc" | "desc";
  const defaultStatus = (status || "OPEN") as "OPEN" | "CLOSED" | "INPROGRESS" | "ARCHIVED";

  try {
    const data = await PostService.getCommentsByUserId(user.id, defaultStatus, defaulOrderBy, limit, offset);
    const response = new Success(COMMENT_FETCHED_SUCCESSFULLY_MSG, {
      comments: data.comments,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get current logged in user friends */
export const getMyFriends = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriends(user.id, limit, offset);
    const response = new Success(FRIENDS_FETCHED_SUCCESSFULLY_MSG, {
      friends: data.friends,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Add a friend */
export const addFriend = async (req: Request, res: Response, next: NextFunction) => {
  const { friendId } = req.params;

  if (!friendId) {
    return next(new ValidationError(INVALID_FRIEND_ID));
  }

  const { user } = req.session;

  try {
    const data = await FriendService.addFriend(user.id, Number(friendId));
    // TODO: send notification to the user and send email
    const response = new Success(FRIEND_REQUEST_SENT_SUCCESSFULLY_MSG, { friend: data });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Accept or reject friend request */
export const acceptOrRejectFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as AcceptOrRejectFriendRequestPayload;
  const validation = FriendService.validateAcceptOrRejectFriendRequestPayload(payload);

  if (!validation.success) {
    return next(new ValidationError(validation.message));
  }

  const { friendId } = req.params;
  const { user } = req.session;

  if (!friendId) {
    return next(new ValidationError(INVALID_FRIEND_ID));
  }

  try {
    const data = await FriendService.acceptOrRejectFriendRequest(
      user.id,
      Number(friendId),
      payload.requestId,
      payload.type
    );
    // TODO: send notification to the user who sent the request

    const msg =
      payload.type === "ACCEPT"
        ? FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY_MSG
        : FRIEND_REQUEST_REJECTED_SUCCESSFULLY_MSG;

    const response = new Success(msg, {
      friend: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all friend requests of current logged in user */
export const getMyFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FriendService.getFriendRequests(user.id, limit, offset);

    const response = new Success(FRIEDN_REQUESTS_FETCHED_SUCCESSFULLY_MSG, {
      requests: data.requests,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all followers of current logged in user */
export const getMyFollowers = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowersByUserId(user.id, limit, offset);
    const response = new Success("Followers fetched successfully", {
      followers: data.followers,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all followings of current logged in user */
export const getMyFollowings = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;

  try {
    const data = await FollowerService.getFollowingByUserId(user.id, limit, offset);
    const response = new Success("Followings fetched successfully", {
      followers: data.following,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Follow a user */
export const startFollowing = async (req: Request, res: Response, next: NextFunction) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return next(new ValidationError("Invalid following id"));
  }

  try {
    const data = await FollowerService.startFollowing(user.id, Number(followingId));
    const response = new Success("Started following successfully", {
      follower: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Unfollow a user */
export const stopFollowing = async (req: Request, res: Response, next: NextFunction) => {
  const { followingId } = req.params;
  const { user } = req.session;

  if (!followingId) {
    return next(new ValidationError("Invalid following id"));
  }

  try {
    const data = await FollowerService.stopFollowing(user.id, Number(followingId));
    const response = new Success("Unfollowed successfully", {
      follower: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all groups of current logged in user */
export const getAllMyGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { created, joined } = req.query;
  const { user } = req.session;

  if (created && joined && typeof created !== "boolean" && typeof joined !== "boolean") {
    return next(new ValidationError("Invalid query params"));
  }

  const isCreated = created === "true";
  const isJoined = joined === "true";

  try {
    const data = await GroupService.getAllGroupsByUserId(user.id, limit, offset, isCreated, isJoined);
    // TODO: Move messages to constants
    const response = new Success("Groups fetched successfully", {
      groups: data.groups,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all requested groups of current logged in user */
export const getRequestedGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { pending, rejected } = req.query;

  if (pending && rejected && typeof pending !== "boolean" && typeof rejected !== "boolean") {
    return next(new ValidationError("Invalid query params"));
  }

  const isPending = pending === "true";
  const isRejected = rejected === "true";

  try {
    const data = await GroupService.getRequestedGroupsByUserId(user.id, limit, offset, isPending, isRejected);
    const response = new Success("Requested groups fetched successfully", {
      groups: data.groups,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

// IMPLEMENTME: Implement this
export const updateMyDetails = async (req: Request, res: Response) => {
  return res.status(StatusCodes.NOT_IMPLEMENTED).json({
    message: "Not implemented",
  });
};
