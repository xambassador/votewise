import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

import type {
  AcceptRejectGroupInvitationPayload,
  AcceptRejectGroupRequestPayload,
  CreateGroupPayload,
} from "@votewise/types";

import { JSONResponse } from "@/src/lib";
import GroupService from "@/src/services/group";
import {
  SOMETHING_WENT_WRONG_MSG,
  UNAUTHORIZED_RESPONSE,
  VALIDATION_FAILED_MSG,
  getErrorReason,
  getLimitAndOffset,
} from "@/src/utils";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, NOT_FOUND, UNAUTHORIZED } = httpStatusCodes;

export const createGroup = async (req: Request, res: Response) => {
  const payload = req.body as CreateGroupPayload;
  const isValid = GroupService.validateCreateGroupPayload(payload);

  if (!isValid.success) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: isValid.message,
        },
        false
      )
    );
  }

  const { user } = req.session;

  try {
    const data = await GroupService.createGroup(user.id, payload);
    return res.status(OK).json(
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
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const joinGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Group id is required",
        },
        false
      )
    );
  }

  try {
    const data = await GroupService.joinGroup(user.id, Number(groupId));
    return res.status(OK).json(
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
    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "You are already a member of this group") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "You have already sent a request to join this group") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getGroups = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  try {
    const data = await GroupService.getGroups(limit, offset);
    return res.status(OK).json(
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
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getRequests = async (req: Request, res: Response) => {
  const { limit, offset } = getLimitAndOffset(req);
  const { user } = req.session;
  const { groupId } = req.query;

  try {
    const data = await GroupService.getRequests(user.id, Number(groupId), limit, offset);
    return res.status(OK).json(
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
    if (msg === "You are not a member of any group") {
      return res.status(BAD_REQUEST).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "You are not an admin of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectGroupRequest = async (req: Request, res: Response) => {
  const { groupId, userId: requestedUserId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupRequestPayload;

  try {
    await GroupService.acceptOrRejectRequest(user.id, Number(groupId), Number(requestedUserId), action);
    const msg = action === "ACCEPT" ? "Request accepted successfully" : "Request rejected successfully";
    return res.status(OK).json(
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
    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "You are not an admin of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (msg === "Request not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const acceptOrRejectGroupInvitation = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { action } = req.body as AcceptRejectGroupInvitationPayload;

  if (!groupId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Group id is required",
        },
        false
      )
    );
  }

  try {
    await GroupService.acceptOrRejectGroupInvitation(Number(groupId), user.id, action);
    const msg = action === "ACCEPT" ? "Invitation accepted successfully" : "Invitation rejected successfully";
    return res.status(OK).json(
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

    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "Request not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const leaveGroup = async (req: Request, res: Response) => {
  const { user } = req.session;
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Group id is required",
        },
        false
      )
    );
  }

  try {
    await GroupService.leaveGroup(user.id, Number(groupId));
    return res.status(OK).json(
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
    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "User is not a member of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }
    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const removeMemberFromGroup = async (req: Request, res: Response) => {
  const { groupId, userId: removingUserId } = req.params;
  const { user } = req.session;

  if (!groupId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Group id is required",
        },
        false
      )
    );
  }

  if (!removingUserId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "User id is required",
        },
        false
      )
    );
  }

  try {
    await GroupService.removeMemberFromGroup(user.id, Number(groupId), Number(removingUserId));
    return res.status(OK).json(
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
    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "User is not a member of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (msg === "You are not admin of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
export const getGropMembers = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { user } = req.session;
  const { limit, offset } = getLimitAndOffset(req);

  // TODO: Remove this to constants
  if (!groupId) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        VALIDATION_FAILED_MSG,
        null,
        {
          message: "Group id is required",
        },
        false
      )
    );
  }

  try {
    const data = await GroupService.getGroupMembers(user.id, Number(groupId), limit, offset);
    return res.status(OK).json(
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
    if (msg === "Group not found") {
      return res.status(NOT_FOUND).json(
        new JSONResponse(
          msg,
          null,
          {
            message: msg,
          },
          false
        )
      );
    }

    if (msg === "You are not member of this group") {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    return res.status(INTERNAL_SERVER_ERROR).json(
      new JSONResponse(
        SOMETHING_WENT_WRONG_MSG,
        null,
        {
          message: msg,
        },
        false
      )
    );
  }
};
