export type ImageFormat = "image/avif" | "image/webp";

export type ImageContentType =
  | "image/avif"
  | "image/webp"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/x-icon"
  | "image/bmp"
  | "image/tiff";

export type XCacheHeader = "MISS" | "HIT" | "STALE";

export interface ImageConfigComplete {
  /**
   * Device breakpoint sizes for responsive images for generate srcset.
   * @default [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
   */
  deviceSizes: number[];

  /**
   * Fixed width image sizes.
   * @default [32, 48, 64, 96, 128, 256, 384]
   */
  imageSizes: number[];

  /**
   * Minimum cache TTL in seconds.
   * @default 31536000 (1 year)
   */
  minimumCacheTTL: number;

  /**
   * Supported output formats(order matters).
   * @default ['image/avif', 'image/webp']
   */
  formats: ImageFormat[];

  /**
   * Content-Disposition header type for served images.
   * 'inline' displays in browser, 'attachment' triggers download.
   * @default 'inline'
   */
  contentDispositionType: "inline" | "attachment";

  /**
   * Allowed quality values for image optimization.
   * @default [75]
   */
  qualities: number[];

  /**
   * Whether to skip image optimization entirely.
   * @default false
   */
  unoptimized: boolean;
}

export type ImageConfig = Partial<ImageConfigComplete>;

export interface ImageParamsResult {
  /**
   * The URL/path to the source image.
   */
  url: string;

  /**
   * Target width for the optimized image.
   */
  width: number;

  /**
   * Quality setting for the optimized image (1-100).
   */
  quality: number;

  /**
   * The MIME type to use for the output image.
   * Determined by Accept header negotiation.
   */
  mimeType: string;

  /**
   * All allowed sizes (deviceSizes + imageSizes).
   */
  sizes: number[];

  /**
   * The minimum cache TTL to use for this image.
   */
  minimumCacheTTL: number;
}

export interface OptimizedImageResult {
  /**
   * The optimized image data.
   */
  buffer: Buffer;

  /**
   * Content type of the optimized image.
   */
  contentType: string;

  /**
   * Cache max-age in seconds.
   */
  maxAge: number;

  /**
   * ETag for cache validation.
   */
  etag: string;

  /**
   * Original image ETag (before optimization).
   */
  upstreamEtag: string;

  /**
   * Error that occurred during optimization (if any).
   * Image will fall back to original if error occurred.
   */
  error?: unknown;
}

export interface CachedImageValue {
  /**
   * The optimized image data.
   */
  buffer: Buffer;

  /**
   * File extension for the optimized image.
   */
  extension: string;

  /**
   * ETag for cache validation.
   */
  etag: string;

  /**
   * Original image ETag (before optimization).
   */
  upstreamEtag: string;
}

export interface CacheEntry {
  /**
   * The cached image value.
   */
  value: CachedImageValue;

  /**
   * When the cache entry expires (Unix timestamp in ms).
   */
  expireAt: number;

  /**
   * Max-age in seconds from the original response.
   */
  maxAge: number;

  /**
   * Whether the cache entry is stale.
   */
  isStale: boolean;
}

export interface ImageUpstream {
  /**
   * Raw image buffer from the source.
   */
  buffer: Buffer;

  /**
   * Content type from the source.
   */
  contentType: string | null;

  /**
   * ETag from the source.
   */
  etag: string;
}

export interface OptimizeImageOptions {
  /**
   * Source image buffer.
   */
  buffer: Buffer;

  /**
   * Target content type for the output.
   */
  contentType: string;

  /**
   * Quality setting (1-100).
   */
  quality: number;

  /**
   * Target width.
   */
  width: number;

  /**
   * Target height (optional, maintains aspect ratio if not specified).
   */
  height?: number;

  /**
   * Sharp concurrency setting.
   */
  concurrency?: number | null;

  /**
   * Maximum input pixels to process.
   */
  limitInputPixels?: number;

  /**
   * Whether to read the image sequentially (lower memory usage).
   */
  sequentialRead?: boolean | null;

  /**
   * Timeout in seconds for the optimization operation.
   * @default 7
   */
  timeoutInSeconds?: number;
}

export class ImageError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ImageError";
  }
}
