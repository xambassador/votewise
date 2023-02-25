/**
 * @file: generateErrorMessage.ts
 * @description: Contain a single function to generate error message from zod errors
 */
import type { ZodIssue } from "zod";

const generateErrorMessage = (errors: ZodIssue[]) => {
  const errorMessages = errors.map((error) => error.message);
  return errorMessages.join(", ");
};

export { generateErrorMessage };
