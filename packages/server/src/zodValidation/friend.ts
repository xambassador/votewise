import { z } from "zod";

import type { AcceptOrRejectFriendRequestPayload } from "@votewise/types";

import { generateErrorMessage } from "@/src/zodValidation/generateErrorMessage";

const schema = z.object({
  requestId: z
    .number({
      required_error: "requestId is required",
    })
    .positive(),
  type: z.union([z.literal("ACCEPT"), z.literal("REJECT")], {
    required_error: "type is required",
  }),
});

type Response<TSuccess extends boolean> = TSuccess extends true
  ? { success: true; message: null }
  : { success: false; message: string };

export const validateAcceptOrRejectFriendRequestPayload = (
  payload: AcceptOrRejectFriendRequestPayload
): Response<boolean> => {
  const isValid = schema.safeParse(payload);

  if (!isValid.success) {
    const msg = generateErrorMessage(isValid.error.issues);
    return {
      success: false,
      message: msg,
    };
  }

  return {
    success: true,
    message: null,
  };
};
