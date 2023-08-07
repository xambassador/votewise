import type { ZodIssue } from "zod";

const generateErrorMessage = (errors: ZodIssue[]) => {
  const errorMessages = errors.map((error) => error.message);
  return errorMessages.join(", ");
};

export { generateErrorMessage };
