import crypto from "crypto";

const algorithm = "aes-256-gcm";

/**
 * Encrypts a string using a symmetric key
 *
 * @param data - The string to be encrypted
 * @param key - The key to use for encryption
 * @returns - The encrypted string
 */
export function symmetricEncrypt(data: string, key: string): string {
  if (key.length !== 32) {
    throw new Error("Key length must be 32 characters");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  const result = Buffer.concat([iv, Buffer.from(encrypted, "base64"), authTag]);
  return result.toString("base64");
}

/**
 * Decrypts a string using a symmetric key
 *
 * @param data - The string to be decrypted
 * @param key - The key to use for decryption
 * @returns - The decrypted string
 */
export function symmetricDecrypt(data: string, key: string): string | null {
  if (key.length !== 32) {
    throw new Error("Key length must be 32 characters");
  }

  try {
    const buffer = Buffer.from(data, "base64");
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(-16);
    const encrypted = buffer.subarray(12, -16);
    const encryptedBufferView = Buffer.from(encrypted).toString("binary");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedBufferView, "binary", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return null;
  }
}
