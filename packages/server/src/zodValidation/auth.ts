/**
 * @file: auth.ts
 * @description: This file contains all zod schemas for auth routes and controllers
 */
import { z } from "zod";

import type { LoginPayload, RegisterUserPayload } from "@votewise/types";

import { generateErrorMessage } from "@/src/zodValidation/generateErrorMessage";

// -----------------------------------------------------------------------------------------
const registerUserSchema = z.object({
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(20),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email address",
    }),
});

const loginSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .optional(),
  email: z
    .string()
    .email({
      message: "Invalid email",
    })
    .optional(),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

const emailSchema = z.string().email({
  message: "Invalid email address",
});

const validateRegisterUserSchema = (payload: RegisterUserPayload) => {
  const isValid = registerUserSchema.safeParse(payload);
  if (!isValid.success) {
    const errorMessage = generateErrorMessage(isValid.error.issues);
    return { success: false, message: errorMessage };
  }
  return { success: true, message: null };
};

export const isEmail = (text: string) => {
  const isValidEmail = emailSchema.safeParse(text);
  return isValidEmail.success;
};

const validateLoginSchema = (payload: LoginPayload) => {
  // Edge case: if username is missing
  if (!payload.username) {
    return { success: false, message: "Username is required" };
  }
  // check if the username is an email
  const isValidEmail = isEmail(payload.username);
  if (isValidEmail) {
    const isValid = loginSchema.safeParse({
      email: payload.username,
      password: payload.password,
    });
    if (!isValid.success) {
      const errorMessage = generateErrorMessage(isValid.error.issues);
      return { success: false, message: errorMessage };
    }
    return { success: true, message: null };
  }
  // if it's not an email, then it's a username
  const isValid = loginSchema.safeParse({
    username: payload.username,
    password: payload.password,
  });
  if (!isValid.success) {
    const errorMessage = generateErrorMessage(isValid.error.issues);
    return { success: false, message: errorMessage };
  }
  return { success: true, message: null };
};

export { validateRegisterUserSchema, validateLoginSchema };
