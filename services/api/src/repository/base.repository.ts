import { DatabaseError } from "@votewise/errors";

export class BaseRepository {
  protected async execute<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message;
        throw new DatabaseError(message);
      }

      throw new DatabaseError("Database error occurred");
    }
  }
}
