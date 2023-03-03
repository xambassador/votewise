import { z } from "zod";

import type { CreatePostPayload } from "@votewise/types";

import { generateErrorMessage } from "./generateErrorMessage";

const CreatePostSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(10)
    .max(100),
  content: z
    .string({
      required_error: "Content is required",
    })
    .min(20)
    .max(1000),
  type: z.enum(["PUBLIC", "GROUP_ONLY"], {
    required_error: "Type is required",
    invalid_type_error: "Type should be either PUBLIC or GROUP_ONLY",
  }),
  status: z.enum(["OPEN", "CLOSED", "ARCHIVED", "INPROGRESS"], {
    required_error: "Status is required",
    invalid_type_error: "Status should be either OPEN, CLOSED, ARCHIVED or INPROGRESS",
  }),
  groupId: z.number().optional(),
});

export const validateCreatePostPayload = (payload: CreatePostPayload) => {
  const isValid = CreatePostSchema.safeParse(payload);

  if (!isValid.success) {
    const msg = generateErrorMessage(isValid.error.issues);
    return {
      success: false,
      message: msg,
    };
  }

  if (payload.type === "GROUP_ONLY" && !payload.groupId) {
    return {
      success: false,
      message: "groupId is required when type is GROUP_ONLY",
    };
  }

  // TODO:
  // Remove me once group routes are implemented
  if (payload.type === "GROUP_ONLY" && payload.groupId) {
    return {
      success: false,
      message: "Group routes are not implemented yet. Create only public posts for now.",
    };
  }

  if (payload.type === "PUBLIC" && payload.groupId) {
    return {
      success: false,
      message: "groupId should not be present when type is PUBLIC",
    };
  }

  return {
    success: true,
    message: null,
  };
};
