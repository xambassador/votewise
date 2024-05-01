import bcrypt from "bcrypt";

export class Crypto {
  /**
   * Hashes a text one-way
   *
   * @param text The text to hash
   * @returns The hashed text
   */
  public async hash(text: string) {
    return bcrypt.hash(text, 10);
  }
}
