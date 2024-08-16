import crypto from "crypto";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { v4 } from "uuid";

const ALGORITHM = "aes256";
const INPUT_ENCODING = "utf8";
const OUTPUT_ENCODING = "hex";
// AES blocksize
const IV_LENGTH = 16;

export class CryptoService {
  constructor() {}

  public symmetricEncrypt(data: string, key: string): string {
    const _key = Buffer.from(key, "latin1");
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, _key, iv);
    let encrypted = cipher.update(data, INPUT_ENCODING, OUTPUT_ENCODING);
    encrypted += cipher.final(OUTPUT_ENCODING);
    return iv.toString(OUTPUT_ENCODING) + ":" + encrypted;
  }

  public symmetricDecrypt(data: string, key: string): string {
    const _key = Buffer.from(key, "latin1");
    const parts = data.split(":");
    const iv = Buffer.from(parts.shift() || "", OUTPUT_ENCODING);
    const encrypted = parts.join(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, _key, iv);
    let decrypted = decipher.update(encrypted, OUTPUT_ENCODING, INPUT_ENCODING);
    decrypted += decipher.final(INPUT_ENCODING);
    return decrypted;
  }

  public generateRandomKey(size = 32): string {
    return nanoid(size);
  }

  public generateRandomToken(size = 32): string {
    return nanoid(size);
  }

  public generateUUID(): string {
    return v4();
  }

  public generateHex() {
    return crypto.randomBytes(32).toString("hex");
  }

  public generateApiKey() {
    const id = nanoid(16);
    const random = crypto.randomBytes(16).toString("hex");
    const apiKey = id + random;
    return "vot_" + apiKey.replace(/\//g, "_").replace(/\+/g, "-").replace(/_/g, "-").slice(0, 32);
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public getOtp(count = 6): number {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < count; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return parseInt(otp, 10);
  }
}
