/**
 * @file: auth.ts
 * @description: This file contains all zod schemas for auth routes and controllers
 */
import { z } from "zod";

import type { RegisterUserPayload } from "@votewise/types";

import { generateErrorMessage } from "./generateErrorMessage";

// -----------------------------------------------------------------------------------------
const registerUserSchema = z.object({
  //   username: z
  //     .string({
  //       required_error: "Username is required",
  //       invalid_type_error: "Username must be a string",
  //     })
  //     .min(3, {
  //       message: "Username must be at least 3 characters long",
  //     })
  //     .max(20),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(20),
  //   about: z
  //     .string({
  //       required_error: "About is required",
  //       invalid_type_error: "About must be a string",
  //     })
  //     .min(10, {
  //       message: "About must be at least 10 characters long",
  //     })
  //     .max(100),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email address",
    }),
  //   gender: z.enum(["MALE", "FEMALE", "OTHER"], {
  //     required_error: "Gender is required",
  //   }),
  //   name: z
  //     .string({
  //       required_error: "Name is required",
  //       invalid_type_error: "Name must be a string",
  //     })
  //     .min(3, {
  //       message: "Name must be at least 3 characters long",
  //     })
  //     .max(20),
});

const validateRegisterUserSchema = (payload: RegisterUserPayload) => {
  const isValid = registerUserSchema.safeParse(payload);
  if (!isValid.success) {
    const errorMessage = generateErrorMessage(isValid.error.issues);
    return { success: false, message: errorMessage };
  }
  return { success: true, message: null };
};

export { validateRegisterUserSchema };
