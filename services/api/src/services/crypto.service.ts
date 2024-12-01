import crypto from "crypto";
import { compare, hash } from "bcrypt";
import { nanoid } from "nanoid";
import { authenticator, totp } from "otplib";
import { toDataURL } from "qrcode";
import { v4 } from "uuid";

const ALGORITHM = "aes256";
const INPUT_ENCODING = "utf8";
const OUTPUT_ENCODING = "hex";
// AES blocksize
const IV_LENGTH = 16;

enum HashAlgorithms {
  "SHA1" = "sha1",
  "SHA256" = "sha256",
  "SHA512" = "sha512"
}

export class CryptoService {
  constructor() {}

  /**
   * Encrypts a string using a symmetric key
   *
   * @param data - The string to be encrypted
   * @param key - The key to use for encryption
   * @returns - The encrypted string
   */
  public symmetricEncrypt(data: string, key: string): string {
    if (key.length !== 32) {
      throw new Error("Key length must be 32 characters");
    }
    const _key = Buffer.from(key);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, _key, iv);
    let encrypted = cipher.update(data, INPUT_ENCODING, OUTPUT_ENCODING);
    encrypted += cipher.final(OUTPUT_ENCODING);
    return iv.toString(OUTPUT_ENCODING) + ":" + encrypted;
  }

  /**
   * Decrypts a string using a symmetric key
   *
   * @param data  - The encrypted string to be decrypted
   * @param key  - The key to use for decryption. Should be the same key used for encryption
   * @returns - The decrypted string
   */
  public symmetricDecrypt(data: string, key: string): string {
    if (key.length !== 32) {
      throw new Error("Key length must be 32 characters");
    }
    const _key = Buffer.from(key);
    const parts = data.split(":");
    const iv = Buffer.from(parts.shift() || "", OUTPUT_ENCODING);
    const encrypted = parts.join(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, _key, iv);
    let decrypted = decipher.update(encrypted, OUTPUT_ENCODING, INPUT_ENCODING);
    decrypted += decipher.final(INPUT_ENCODING);
    return decrypted;
  }

  public generateUUID(): string {
    return v4();
  }

  public generateHex(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  public generateApiKey(): string {
    const id = nanoid(16);
    const random = crypto.randomBytes(16).toString("hex");
    const apiKey = id + random;
    return "vot_" + apiKey.replace(/\//g, "_").replace(/\+/g, "-").replace(/_/g, "-").slice(0, 32);
  }

  public async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  public getOtp(secret: string, digits = 6): string {
    const windowInSeconds = 300;
    totp.options = { algorithm: HashAlgorithms.SHA256, digits, step: windowInSeconds };
    const otp = totp.generate(secret);
    return otp;
  }

  public verifyOtp(secret: string, otp: string, digits = 6): boolean {
    const windowInSeconds = 300;
    totp.options = { algorithm: HashAlgorithms.SHA256, digits, step: windowInSeconds };
    return totp.check(otp, secret);
  }

  public hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  public generate2FASecret(): string {
    return authenticator.generateSecret();
  }

  public verify2FACode(secret: string, token: string): boolean {
    authenticator.options = { window: [2, 2] };
    const delta = authenticator.checkDelta(token, secret);
    if (!Number.isInteger(delta)) return false;
    if (delta !== 0) return false;
    return true;
  }

  /**
   * Creates a QR code for the 2FA secret
   *
   * @param secret - The secret key used to generate the QR code
   * @param label - The label to display on the 2FA app
   * @param issuer - The issuer to display on the 2FA app
   */
  public generate2FAQRCode(secret: string, label: string, issuer: string): Promise<string> {
    return toDataURL(authenticator.keyuri(label, issuer, secret));
  }

  public generateKeyUri(secret: string, label: string, issuer: string): string {
    return authenticator.keyuri(label, issuer, secret);
  }
}
