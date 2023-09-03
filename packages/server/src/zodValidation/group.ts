import { z } from "zod";

import type { CreateGroupPayload } from "@votewise/types";

import { generateErrorMessage } from "@/src/zodValidation/generateErrorMessage";

const schema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1)
    .max(255),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1)
    .max(400),
  type: z.enum(["PUBLIC", "PRIVATE"], {
    required_error: "Type is required",
  }),
  status: z.enum(["OPEN", "CLOSED", "INACTIVE"], {
    required_error: "Status is required",
  }),
  joinThroghInvite: z.boolean({
    required_error: "Join through invite is required",
  }),
});

type Response<TSuccess extends boolean> = TSuccess extends true
  ? { success: true; message: null }
  : { success: false; message: string };

const validateCreateGroupPayload = (payload: CreateGroupPayload): Response<boolean> => {
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

export { validateCreateGroupPayload };
