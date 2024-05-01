import crypto from "crypto";
import { enc, SHA256 } from "crypto-js";
import { nanoid } from "nanoid";

/* ----------------------------------------------------------------------------------------------- */

export const generateId = () => {
  let sequenceNumber = Date.now() | 0;
  // Multiple of 3 for base64 encoding
  const rand = Buffer.alloc(15);
  sequenceNumber = (sequenceNumber + 1) | 0;
  rand.writeInt32BE(sequenceNumber, 11);
  crypto.randomBytes(12).copy(rand);
  return "vot_" + rand.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
};

export const generateApiKey = () => {
  const id = nanoid(16);
  const random = crypto.randomBytes(16).toString("hex");
  const apiKey = id + random;
  return "vot_" + apiKey.replace(/\//g, "_").replace(/\+/g, "-").replace(/_/g, "-").slice(0, 32);
};

export const generateHexId = () => crypto.randomBytes(32).toString("hex");
export const generateSHA256Hash = (data: string) => SHA256(data).toString(enc.Hex);
