import type {
  AcceptRejectGroupInvitationPayload,
  AcceptRejectGroupRequestPayload,
  CreateGroupPayload,
  UpdateGroupDetailsPayload,
} from "@votewise/types";
import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import Success from "@/src/classes/Success";
import ValidationError from "@/src/classes/ValidationError";

import GroupService from "@/src/services/group";
import { getLimitAndOffset } from "@/src/utils";
/* ----------------------------------------------------------------------------------------------- */

/** Create a new group */
export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CreateGroupPayload;
  const validate = GroupService.validateCreateGroupPayload(payload);

  if (!validate.success) return next(new ValidationError(validate.message));

  const { user } = req.session;

  try {
    const data = await GroupService.createGroup(user.id, payload);
    const response = new Success("Group created successfully", {
      group: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Join the group */
export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return next(new ValidationError("Group id is required"));
  }

  try {
    const data = await GroupService.joinGroup(user.id, Number(groupId));
    const response = new Success("Group joined successfully", {
      group: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get all groups */
export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  try {
    const data = await GroupService.getGroups(limit, offset);
    const response = new Success("Groups fetched successfully", {
      groups: data.groups,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/**
 * Get group join requests (can be filtered by group id)
 */
export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { groupId } = req.query;

  try {
    const data = await GroupService.getRequests(user.id, Number(groupId), limit, offset);
    const response = new Success("Requests fetched successfully", {
      requests: data.requests,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Accept or reject group join request */
export const acceptOrRejectGroupRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId, userId: requestedUserId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupRequestPayload;

  try {
    await GroupService.acceptOrRejectRequest(user.id, Number(groupId), Number(requestedUserId), action);
    const msg = action === "ACCEPT" ? "Request accepted successfully" : "Request rejected successfully";
    const response = new Success(msg, { message: msg });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Accept or reject group invitation */
export const acceptOrRejectGroupInvitation = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupInvitationPayload;

  if (!groupId) {
    return next(new ValidationError("Group id is required"));
  }

  try {
    await GroupService.acceptOrRejectGroupInvitation(Number(groupId), user.id, action);
    const msg = action === "ACCEPT" ? "Invitation accepted successfully" : "Invitation rejected successfully";
    const response = new Success(msg, { message: msg });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Leave the group */
export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  const { groupId } = req.params;

  if (!groupId) {
    return next(new ValidationError("Group id is required"));
  }

  try {
    await GroupService.leaveGroup(user.id, Number(groupId));
    const msg = "You have been leaved from this group.";
    const response = new Success(msg, { message: msg });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Remove member from the group */
export const removeMemberFromGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId, userId: removingUserId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return next(new ValidationError("Group id is required"));
  }

  if (!removingUserId) {
    return next(new ValidationError("User id is required"));
  }

  try {
    await GroupService.removeMemberFromGroup(user.id, Number(groupId), Number(removingUserId));
    const msg = "Member removed successfully";
    const response = new Success(msg, { message: msg });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Get group members */
export const getGropMembers = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);

  if (!groupId) {
    return next(new ValidationError("Group id is required"));
  }

  try {
    const data = await GroupService.getGroupMembers(user.id, Number(groupId), limit, offset);
    const response = new Success("Group members fetched successfully", {
      members: data.members,
      meta: data.meta,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Update group details */
export const updateGroupDetails = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as UpdateGroupDetailsPayload;
  const isValid = GroupService.validateCreateGroupPayload(payload);

  if (!isValid.success) {
    return next(new ValidationError(isValid.message));
  }

  const { groupId } = req.params;
  const { user } = req.session;

  try {
    const data = await GroupService.updateGroupDetails(user.id, Number(groupId), payload);
    const response = new Success("Group details updated successfully", {
      group: data,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};
