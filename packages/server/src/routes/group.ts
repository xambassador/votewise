import { Router } from "express";

import {
  ACCEPT_REJECT_GROUP_REQUEST_ME_V1,
  ACCEPT_REJECT_GROUP_REQUEST_V1,
  CREATE_GROUP_V1,
  GET_GROUPS_V1,
  GET_GROUP_MEMBERS_V1,
  GET_GROUP_REQUESTS_V1,
  JOIN_GROUP_V1,
  LEAVE_GROUP_V1,
  REMOVE_MEMBER_FROM_GROUP_V1,
  UPDATE_GROUP_V1,
} from "@/src/configs";
import {
  acceptOrRejectGroupInvitation,
  acceptOrRejectGroupRequest,
  createGroup,
  getGropMembers,
  getGroups,
  getRequests,
  joinGroup,
  leaveGroup,
  removeMemberFromGroup,
  updateGroupDetails,
} from "@/src/controllers";
import authorizationMiddleware from "@/src/middlewares/auth";
import onboardedMiddleware from "@/src/middlewares/onboarded";

const router = Router();

router.get(GET_GROUPS_V1, authorizationMiddleware, onboardedMiddleware, getGroups);
router.get(GET_GROUP_REQUESTS_V1, authorizationMiddleware, onboardedMiddleware, getRequests);
router.get(GET_GROUP_MEMBERS_V1, authorizationMiddleware, onboardedMiddleware, getGropMembers);

router.post(CREATE_GROUP_V1, authorizationMiddleware, onboardedMiddleware, createGroup);
router.post(JOIN_GROUP_V1, authorizationMiddleware, onboardedMiddleware, joinGroup);

router.patch(
  ACCEPT_REJECT_GROUP_REQUEST_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  acceptOrRejectGroupRequest
);
router.patch(
  ACCEPT_REJECT_GROUP_REQUEST_ME_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  acceptOrRejectGroupInvitation
);
router.patch(
  REMOVE_MEMBER_FROM_GROUP_V1,
  authorizationMiddleware,
  onboardedMiddleware,
  removeMemberFromGroup
);
router.patch(UPDATE_GROUP_V1, authorizationMiddleware, onboardedMiddleware, updateGroupDetails);

router.delete(LEAVE_GROUP_V1, authorizationMiddleware, onboardedMiddleware, leaveGroup);

export default router;
