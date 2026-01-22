export type {
  ImageFormat,
  ImageContentType,
  XCacheHeader,
  ImageConfigComplete,
  ImageConfig,
  ImageParamsResult,
  OptimizedImageResult,
  CachedImageValue,
  CacheEntry,
  ImageUpstream,
  OptimizeImageOptions
} from "./types";

export { ImageError } from "./types";

export {
  CACHE_VERSION,
  DEFAULT_MINIMUM_CACHE_TTL,
  MIME_TYPES,
  ANIMATABLE_TYPES,
  BYPASS_TYPES,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  DEFAULT_FORMATS,
  DEFAULT_QUALITIES,
  createImageConfigDefault,
  getAllowedSizes,
  isAllowedSize,
  isAllowedQuality,
  getExtensionFromContentType,
  getContentTypeFromExtension,
  shouldBypassOptimization,
  isAnimatableType
} from "./config";

export { detectContentType, isAnimatedImage } from "./content-type";

export { optimizeImage, processImage } from "./optimizer";

export { ImageOptimizerCache } from "./cache";

export { getImageEtag, getCacheKey, extractEtag, getSupportedMimeType, getFileNameWithExtension } from "./utils";

export { validateParams } from "./validate-params";
