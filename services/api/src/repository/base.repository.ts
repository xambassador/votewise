import { DatabaseError } from "@votewise/errors";
import { Prisma } from "@votewise/prisma";

export class BaseRepository {
  async execute<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const message = err.message;
        throw new DatabaseError(message);
      }

      if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        const message = err.message;
        throw new DatabaseError(message);
      }

      if (err instanceof Error) {
        const message = err.message;
        throw new DatabaseError(message);
      }

      throw new DatabaseError("Database error occurred");
    }
  }
}
