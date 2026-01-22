import type { ImageConfigComplete, ImageUpstream, OptimizedImageResult, OptimizeImageOptions } from "./types";

import sharp, { concurrency as setSharpConcurrency } from "sharp";

import { isAnimatableType, MIME_TYPES, shouldBypassOptimization } from "./config";
import { detectContentType, isAnimatedImage } from "./content-type";
import { ImageError } from "./types";
import { getImageEtag } from "./utils";

const DEFAULT_TIMEOUT_SECONDS = 7;

export async function optimizeImage(options: OptimizeImageOptions): Promise<Buffer> {
  const {
    buffer,
    contentType,
    quality,
    width,
    height,
    concurrency,
    limitInputPixels,
    sequentialRead,
    timeoutInSeconds = DEFAULT_TIMEOUT_SECONDS
  } = options;

  if (concurrency !== undefined && concurrency !== null) {
    setSharpConcurrency(concurrency);
  }

  const transformer = sharp(buffer, {
    limitInputPixels: limitInputPixels ?? undefined,
    sequentialRead: sequentialRead ?? undefined
  })
    .timeout({ seconds: timeoutInSeconds })
    .rotate();

  if (height) {
    transformer.resize(width, height);
  } else {
    transformer.resize(width, undefined, { withoutEnlargement: true });
  }

  switch (contentType) {
    case MIME_TYPES.AVIF:
      transformer.avif({
        quality: Math.max(quality - 20, 1),
        effort: 3
      });
      break;

    case MIME_TYPES.WEBP:
      transformer.webp({ quality });
      break;

    case MIME_TYPES.PNG:
      transformer.png({ quality });
      break;

    case MIME_TYPES.JPEG:
      transformer.jpeg({
        quality,
        mozjpeg: true
      });
      break;

    default:
      break;
  }

  return transformer.toBuffer();
}

export async function processImage(
  imageUpstream: ImageUpstream,
  params: {
    url: string;
    width: number;
    quality: number;
    mimeType: string;
  },
  config: ImageConfigComplete
): Promise<OptimizedImageResult> {
  const { buffer: upstreamBuffer, etag: upstreamEtag } = imageUpstream;
  const { quality, width, mimeType } = params;

  const maxAge = config.minimumCacheTTL;

  const detectedType = await detectContentType(upstreamBuffer);

  if (!detectedType || !detectedType.startsWith("image/")) {
    throw new ImageError(400, "The requested resource isn't a valid image.");
  }

  if (shouldBypassOptimization(detectedType)) {
    return {
      buffer: upstreamBuffer,
      contentType: detectedType,
      maxAge,
      etag: upstreamEtag,
      upstreamEtag
    };
  }

  if (isAnimatableType(detectedType)) {
    const isAnimated = await isAnimatedImage(upstreamBuffer, detectedType);
    if (isAnimated) {
      return {
        buffer: upstreamBuffer,
        contentType: detectedType,
        maxAge,
        etag: upstreamEtag,
        upstreamEtag
      };
    }
  }

  let outputContentType: string;
  if (mimeType) {
    // If Accept header specifies a type
    outputContentType = mimeType;
  } else if (detectedType !== MIME_TYPES.WEBP && detectedType !== MIME_TYPES.AVIF) {
    outputContentType = detectedType;
  } else {
    outputContentType = MIME_TYPES.JPEG;
  }

  try {
    const optimizedBuffer = await optimizeImage({
      buffer: upstreamBuffer,
      contentType: outputContentType,
      quality,
      width
    });

    return {
      buffer: optimizedBuffer,
      contentType: outputContentType,
      maxAge,
      etag: getImageEtag(optimizedBuffer),
      upstreamEtag
    };
  } catch (error) {
    return {
      buffer: upstreamBuffer,
      contentType: detectedType,
      maxAge,
      etag: upstreamEtag,
      upstreamEtag,
      error
    };
  }
}
