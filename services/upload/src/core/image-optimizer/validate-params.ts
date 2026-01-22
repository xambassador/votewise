import type { ImageConfigComplete, ImageParamsResult } from "./types";

import { getAllowedSizes, isAllowedQuality } from "./config";
import { getSupportedMimeType } from "./utils";

export type ValidateParamsResult = { success: false; error: string } | { success: true; data: ImageParamsResult };

export function validateParams(
  query: Record<string, string | string[] | undefined>,
  acceptHeader: string | undefined,
  config: ImageConfigComplete
): ValidateParamsResult {
  const url = query.url;
  if (!url) {
    return { success: false, error: '"url" parameter is required' };
  }
  if (Array.isArray(url)) {
    return { success: false, error: '"url" parameter cannot be an array' };
  }
  if (url.length > 3072) {
    return { success: false, error: '"url" parameter is too long' };
  }

  if (!url.startsWith("/uploads/") && !url.startsWith("/votewise/assets/")) {
    return { success: false, error: '"url" parameter must start with /uploads/ or /votewise/assets/' };
  }

  if (url.includes("..") || url.includes("//")) {
    return { success: false, error: '"url" parameter contains invalid path' };
  }

  const w = query.w;
  if (!w) {
    return { success: false, error: '"w" parameter (width) is required' };
  }
  if (Array.isArray(w)) {
    return { success: false, error: '"w" parameter (width) cannot be an array' };
  }
  if (!/^\d+$/.test(w)) {
    return { success: false, error: '"w" parameter (width) must be a positive integer' };
  }

  const width = parseInt(w, 10);
  if (width <= 0 || isNaN(width)) {
    return { success: false, error: '"w" parameter (width) must be greater than 0' };
  }

  const sizes = getAllowedSizes(config);
  const isValidSize = sizes.includes(width);
  if (!isValidSize) {
    return {
      success: false,
      error: `"w" parameter (width) of ${width} is not allowed. Allowed sizes: ${sizes.join(", ")}`
    };
  }

  const q = query.q;
  if (!q) {
    return { success: false, error: '"q" parameter (quality) is required' };
  }
  if (Array.isArray(q)) {
    return { success: false, error: '"q" parameter (quality) cannot be an array' };
  }
  if (!/^\d+$/.test(q)) {
    return { success: false, error: '"q" parameter (quality) must be a positive integer' };
  }

  const quality = parseInt(q, 10);
  if (quality < 1 || quality > 100 || isNaN(quality)) {
    return { success: false, error: '"q" parameter (quality) must be between 1 and 100' };
  }

  if (!isAllowedQuality(quality, config)) {
    return {
      success: false,
      error: `"q" parameter (quality) of ${quality} is not allowed. Allowed qualities: ${config.qualities.join(", ")}`
    };
  }

  const mimeType = getSupportedMimeType(config.formats, acceptHeader);

  return {
    success: true,
    data: {
      url,
      width,
      quality,
      mimeType,
      sizes,
      minimumCacheTTL: config.minimumCacheTTL
    }
  };
}
