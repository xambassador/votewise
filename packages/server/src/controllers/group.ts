import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

import type {
  AcceptRejectGroupInvitationPayload,
  AcceptRejectGroupRequestPayload,
  CreateGroupPayload,
  UpdateGroupDetailsPayload,
} from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import GroupService from "@/src/services/group";
import {
  SOMETHING_WENT_WRONG_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CreateGroupPayload;
  const isValid = GroupService.validateCreateGroupPayload(payload);

  if (!isValid.success) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: isValid.message }));
  }

  const { user } = req.session;

  try {
    const data = await GroupService.createGroup(user.id, payload);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Group created successfully",
        {
          message: "Group created successfully",
          group: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Group id is required" })
    );
  }

  try {
    const data = await GroupService.joinGroup(user.id, Number(groupId));
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Group joined successfully",
        {
          message: "Group joined successfully",
          group: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (
      msg === "You are already a member of this group" ||
      msg === "You have already sent a request to join this group"
    ) {
      return next(createError(StatusCodes.BAD_REQUEST, msg));
    }
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  try {
    const data = await GroupService.getGroups(limit, offset);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Groups fetched successfully",
        {
          message: "Groups fetched successfully",
          groups: data.groups,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { groupId } = req.query;

  try {
    const data = await GroupService.getRequests(user.id, Number(groupId), limit, offset);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Requests fetched successfully",
        {
          message: "Requests fetched successfully",
          requests: data.requests,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;

    if (msg === "You have no groups") return next(createError(StatusCodes.BAD_REQUEST, msg));
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "You are not an admin of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectGroupRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId, userId: requestedUserId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupRequestPayload;

  try {
    await GroupService.acceptOrRejectRequest(user.id, Number(groupId), Number(requestedUserId), action);
    const msg = action === "ACCEPT" ? "Request accepted successfully" : "Request rejected successfully";
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        msg,
        {
          message: msg,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found" || msg === "Request not found")
      return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "You are not an admin of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectGroupInvitation = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupInvitationPayload;

  if (!groupId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Group id is required" })
    );
  }

  try {
    await GroupService.acceptOrRejectGroupInvitation(Number(groupId), user.id, action);
    const msg = action === "ACCEPT" ? "Invitation accepted successfully" : "Invitation rejected successfully";
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        msg,
        {
          message: msg,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;

    if (msg === "Group not found" || msg === "Request not found")
      return next(createError(StatusCodes.NOT_FOUND, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;
  const { groupId } = req.params;

  if (!groupId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Group id is required" })
    );
  }

  try {
    await GroupService.leaveGroup(user.id, Number(groupId));
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Group left successfully",
        {
          message: "Group left successfully",
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "User is not a member of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const removeMemberFromGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId, userId: removingUserId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Group id is required" })
    );
  }

  if (!removingUserId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "User id is required" })
    );
  }

  try {
    await GroupService.removeMemberFromGroup(user.id, Number(groupId), Number(removingUserId));
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Member removed successfully",
        {
          message: "Member removed successfully",
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "User is not a member of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    if (msg === "You are not an admin of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const getGropMembers = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);

  // TODO: Remove this to constants
  if (!groupId) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: "Group id is required" })
    );
  }

  try {
    const data = await GroupService.getGroupMembers(user.id, Number(groupId), limit, offset);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Group members fetched successfully",
        {
          message: "Group members fetched successfully",
          members: data.members,
          meta: data.meta,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "You are not member of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

// -----------------------------------------------------------------------------------------
export const updateGroupDetails = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as UpdateGroupDetailsPayload;
  const isValid = GroupService.validateCreateGroupPayload(payload);

  if (!isValid.success) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: isValid.message }));
  }

  const { groupId } = req.params;
  const { user } = req.session;

  try {
    const data = await GroupService.updateGroupDetails(user.id, Number(groupId), payload);
    return res.status(StatusCodes.OK).json(
      new JSONResponse(
        "Group details updated successfully",
        {
          message: "Group details updated successfully",
          group: data,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || SOMETHING_WENT_WRONG_MSG;
    if (msg === "Group not found") return next(createError(StatusCodes.NOT_FOUND, msg));
    if (msg === "You are not an admin of this group") return next(createError(StatusCodes.FORBIDDEN, msg));
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};
