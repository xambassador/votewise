import type { ImageConfigComplete, ImageFormat } from "./types";

// Update this to invalidate existing cached images.
export const CACHE_VERSION = 1;

// 1 year in seconds.
export const DEFAULT_MINIMUM_CACHE_TTL = 31536000;

export const MIME_TYPES = {
  AVIF: "image/avif",
  WEBP: "image/webp",
  PNG: "image/png",
  JPEG: "image/jpeg",
  GIF: "image/gif",
  ICO: "image/x-icon",
  ICNS: "image/x-icns",
  TIFF: "image/tiff",
  BMP: "image/bmp",
  JXL: "image/jxl",
  JP2: "image/jp2",
  HEIC: "image/heic"
} as const;

export const ANIMATABLE_TYPES = [MIME_TYPES.WEBP, MIME_TYPES.PNG, MIME_TYPES.GIF] as const;
export const BYPASS_TYPES = [MIME_TYPES.ICO, MIME_TYPES.ICNS, MIME_TYPES.BMP, MIME_TYPES.JXL, MIME_TYPES.HEIC] as const;
export const DEFAULT_DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;
export const DEFAULT_IMAGE_SIZES = [32, 48, 64, 96, 128, 256, 384, 512, 640, 750] as const;
export const DEFAULT_FORMATS: ImageFormat[] = ["image/avif", "image/webp"];
export const DEFAULT_QUALITIES = [75] as const;

export function createImageConfigDefault(minimumCacheTTL?: number): ImageConfigComplete {
  return {
    deviceSizes: [...DEFAULT_DEVICE_SIZES],
    imageSizes: [...DEFAULT_IMAGE_SIZES],
    minimumCacheTTL: minimumCacheTTL ?? DEFAULT_MINIMUM_CACHE_TTL,
    formats: [...DEFAULT_FORMATS],
    contentDispositionType: "inline",
    qualities: [...DEFAULT_QUALITIES],
    unoptimized: false
  };
}

export function getAllowedSizes(config: ImageConfigComplete): number[] {
  return [...config.deviceSizes, ...config.imageSizes].sort((a, b) => a - b);
}

export function isAllowedSize(width: number, config: ImageConfigComplete): boolean {
  const sizes = getAllowedSizes(config);

  return sizes.includes(width);
}

export function isAllowedQuality(quality: number, config: ImageConfigComplete): boolean {
  if (quality < 1 || quality > 100) {
    return false;
  }

  if (!config.qualities || config.qualities.length === 0) {
    return true;
  }

  return config.qualities.includes(quality);
}

export function getExtensionFromContentType(contentType: string): string | null {
  switch (contentType) {
    case MIME_TYPES.AVIF:
      return "avif";
    case MIME_TYPES.WEBP:
      return "webp";
    case MIME_TYPES.PNG:
      return "png";
    case MIME_TYPES.JPEG:
      return "jpeg";
    case MIME_TYPES.GIF:
      return "gif";
    case MIME_TYPES.ICO:
      return "ico";
    case MIME_TYPES.ICNS:
      return "icns";
    case MIME_TYPES.TIFF:
      return "tiff";
    case MIME_TYPES.BMP:
      return "bmp";
    case MIME_TYPES.JXL:
      return "jxl";
    case MIME_TYPES.JP2:
      return "jp2";
    case MIME_TYPES.HEIC:
      return "heic";
    default:
      return null;
  }
}

export function getContentTypeFromExtension(extension: string): string | null {
  const ext = extension.toLowerCase().replace(/^\./, "");

  switch (ext) {
    case "avif":
      return MIME_TYPES.AVIF;
    case "webp":
      return MIME_TYPES.WEBP;
    case "png":
      return MIME_TYPES.PNG;
    case "jpg":
    case "jpeg":
      return MIME_TYPES.JPEG;
    case "gif":
      return MIME_TYPES.GIF;
    case "ico":
      return MIME_TYPES.ICO;
    case "icns":
      return MIME_TYPES.ICNS;
    case "tif":
    case "tiff":
      return MIME_TYPES.TIFF;
    case "bmp":
      return MIME_TYPES.BMP;
    case "jxl":
      return MIME_TYPES.JXL;
    case "jp2":
      return MIME_TYPES.JP2;
    case "heic":
      return MIME_TYPES.HEIC;
    default:
      return null;
  }
}

export function shouldBypassOptimization(contentType: string): boolean {
  return (BYPASS_TYPES as readonly string[]).includes(contentType);
}

export function isAnimatableType(contentType: string): boolean {
  return (ANIMATABLE_TYPES as readonly string[]).includes(contentType);
}
