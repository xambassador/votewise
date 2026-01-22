import sharp from "sharp";

import { MIME_TYPES } from "./config";

// https://en.wikipedia.org/wiki/List_of_file_signatures
const SIGNATURES = {
  // JPEG: FF D8 FF
  JPEG: [0xff, 0xd8, 0xff],

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],

  // GIF87a: 47 49 46 38 37 61
  GIF87A: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],

  // GIF89a: 47 49 46 38 39 61
  GIF89A: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],

  // WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46],
  WEBP_WEBP: [0x57, 0x45, 0x42, 0x50],

  // BMP: 42 4D
  BMP: [0x42, 0x4d],

  // ICO: 00 00 01 00
  ICO: [0x00, 0x00, 0x01, 0x00],

  // ICNS: 69 63 6E 73
  ICNS: [0x69, 0x63, 0x6e, 0x73],

  // TIFF (little-endian): 49 49 2A 00
  TIFF_LE: [0x49, 0x49, 0x2a, 0x00],

  // TIFF (big-endian): 4D 4D 00 2A
  TIFF_BE: [0x4d, 0x4d, 0x00, 0x2a],

  // AVIF: 00 00 00 ?? 66 74 79 70 61 76 69 66
  // The 4th byte varies, so we check positions 4-11
  AVIF_FTYP: [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],

  // HEIC: 00 00 00 ?? 66 74 79 70 68 65 69 63
  HEIC_FTYP: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],

  // JP2: 00 00 00 0C 6A 50 20 20 0D 0A 87 0A
  JP2: [0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a],

  // JXL: FF 0A (naked codestream) or 00 00 00 0C 4A 58 4C 20 0D 0A 87 0A (container)
  JXL_NAKED: [0xff, 0x0a],
  JXL_CONTAINER: [0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a]
} as const;

function matchesSignature(buffer: Buffer, signature: readonly number[], offset = 0): boolean {
  if (buffer.length < offset + signature.length) {
    return false;
  }
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

export async function detectContentType(buffer: Buffer): Promise<string | null> {
  if (buffer.length === 0) {
    return null;
  }

  if (matchesSignature(buffer, SIGNATURES.JPEG)) {
    return MIME_TYPES.JPEG;
  }

  if (matchesSignature(buffer, SIGNATURES.PNG)) {
    return MIME_TYPES.PNG;
  }

  if (matchesSignature(buffer, SIGNATURES.GIF87A) || matchesSignature(buffer, SIGNATURES.GIF89A)) {
    return MIME_TYPES.GIF;
  }

  if (matchesSignature(buffer, SIGNATURES.WEBP_RIFF) && matchesSignature(buffer, SIGNATURES.WEBP_WEBP, 8)) {
    return MIME_TYPES.WEBP;
  }

  if (buffer.length >= 12 && matchesSignature(buffer, SIGNATURES.AVIF_FTYP, 4)) {
    return MIME_TYPES.AVIF;
  }

  if (buffer.length >= 12 && matchesSignature(buffer, SIGNATURES.HEIC_FTYP, 4)) {
    return MIME_TYPES.HEIC;
  }

  if (matchesSignature(buffer, SIGNATURES.ICO)) {
    return MIME_TYPES.ICO;
  }

  if (matchesSignature(buffer, SIGNATURES.ICNS)) {
    return MIME_TYPES.ICNS;
  }

  if (matchesSignature(buffer, SIGNATURES.TIFF_LE) || matchesSignature(buffer, SIGNATURES.TIFF_BE)) {
    return MIME_TYPES.TIFF;
  }

  if (matchesSignature(buffer, SIGNATURES.BMP)) {
    return MIME_TYPES.BMP;
  }

  if (matchesSignature(buffer, SIGNATURES.JP2)) {
    return MIME_TYPES.JP2;
  }

  if (matchesSignature(buffer, SIGNATURES.JXL_NAKED) || matchesSignature(buffer, SIGNATURES.JXL_CONTAINER)) {
    return MIME_TYPES.JXL;
  }

  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.format) {
      return formatToMimeType(metadata.format);
    }
  } catch {
    //
  }

  return null;
}

function formatToMimeType(format: string): string | null {
  switch (format) {
    case "jpeg":
    case "jpg":
      return MIME_TYPES.JPEG;
    case "png":
      return MIME_TYPES.PNG;
    case "webp":
      return MIME_TYPES.WEBP;
    case "gif":
      return MIME_TYPES.GIF;
    case "avif":
      return MIME_TYPES.AVIF;
    case "tiff":
    case "tif":
      return MIME_TYPES.TIFF;
    case "heif":
    case "heic":
      return MIME_TYPES.HEIC;
    case "jp2":
      return MIME_TYPES.JP2;
    case "jxl":
      return MIME_TYPES.JXL;
    default:
      return null;
  }
}

export async function isAnimatedImage(buffer: Buffer, contentType: string): Promise<boolean> {
  if (contentType !== MIME_TYPES.GIF && contentType !== MIME_TYPES.WEBP && contentType !== MIME_TYPES.PNG) {
    return false;
  }

  try {
    const metadata = await sharp(buffer, { animated: true }).metadata();
    // image has multiple pages (frames)
    return (metadata.pages ?? 1) > 1;
  } catch {
    return false;
  }
}
