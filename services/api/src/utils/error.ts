import type { ZodError } from "zod";

import { DatabaseError } from "@votewise/lib/errors";

export const transformZodError = (error: ZodError) => error.errors[0].message;

export const getErrorReason = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }
  return null;
};

export async function withDatabaseError<T>(promise: Promise<T>, message: string) {
  try {
    const result = await promise;
    return result;
  } catch (err) {
    throw new DatabaseError(message);
  }
}
