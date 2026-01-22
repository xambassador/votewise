import type { AppContext } from "@/context";
import type { XCacheHeader } from "@/core/image-optimizer";
import type { Request, Response } from "express";

import fs from "node:fs/promises";
import path from "node:path";

import {
  extractEtag,
  getExtensionFromContentType,
  getFileNameWithExtension,
  ImageOptimizerCache,
  processImage,
  validateParams
} from "@/core/image-optimizer";

type ControllerOptions = { ctx: AppContext };

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle(req: Request, res: Response) {
    const validate = validateParams(
      req.query as Record<string, string | string[] | undefined>,
      req.headers.accept,
      this.ctx.imageConfig
    );

    if (!validate.success) {
      res.status(400).json({ error: { message: validate.error } });
      return;
    }

    const { url, width, quality, mimeType } = validate.data;
    const cacheKey = ImageOptimizerCache.getCacheKey({ url, width, quality, mimeType });

    try {
      const cachedEntry = await this.ctx.imageOptimizerCache.get(cacheKey);
      if (cachedEntry && !cachedEntry.isStale) {
        this.sendResponse(res, {
          buffer: cachedEntry.value.buffer,
          contentType: this.getContentTypeFromExtension(cachedEntry.value.extension),
          etag: cachedEntry.value.etag,
          maxAge: cachedEntry.maxAge,
          xCache: "HIT",
          url
        });
        return;
      }

      const uploadDir = path.join(__dirname, "../../../../public");
      const sourcePath = path.join(uploadDir, url);
      let sourceBuffer: Buffer;

      try {
        sourceBuffer = await fs.readFile(sourcePath);
      } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
          res.status(404).json({ error: { message: "Source image not found" } });
          return;
        }
        throw error;
      }

      const upstreamEtag = extractEtag(null, sourceBuffer);

      if (cachedEntry?.value.upstreamEtag === upstreamEtag) {
        this.sendResponse(res, {
          buffer: cachedEntry.value.buffer,
          contentType: this.getContentTypeFromExtension(cachedEntry.value.extension),
          etag: cachedEntry.value.etag,
          maxAge: this.ctx.imageConfig.minimumCacheTTL,
          xCache: "STALE",
          url
        });
        return;
      }

      const optimizedImage = await processImage(
        { buffer: sourceBuffer, etag: upstreamEtag, contentType: null },
        { url, width, quality, mimeType },
        this.ctx.imageConfig
      );

      const extension = getExtensionFromContentType(optimizedImage.contentType) || "bin";
      await this.ctx.imageOptimizerCache.set(cacheKey, {
        buffer: optimizedImage.buffer,
        etag: optimizedImage.etag,
        extension,
        upstreamEtag: optimizedImage.upstreamEtag
      });

      this.sendResponse(res, {
        buffer: optimizedImage.buffer,
        contentType: optimizedImage.contentType,
        etag: optimizedImage.etag,
        maxAge: optimizedImage.maxAge,
        xCache: "MISS",
        url
      });
    } catch (error) {
      this.ctx.logger.error("Image optimization error:", { error, url });
      res.status(500).json({ error: { message: "Failed to optimize image" } });
    }
  }

  private sendResponse(
    res: Response,
    options: {
      buffer: Buffer;
      contentType: string;
      etag: string;
      maxAge: number;
      xCache: XCacheHeader;
      url: string;
    }
  ): void {
    const { buffer, contentType, etag, maxAge, xCache, url } = options;

    const fileName = getFileNameWithExtension(url, contentType);

    res.setHeader("Cache-Control", `public, max-age=${maxAge}, immutable`);
    res.setHeader("Vary", "Accept");
    res.setHeader("ETag", `"${etag}"`);
    res.setHeader("X-Cache", xCache);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `${this.ctx.imageConfig.contentDispositionType}; filename="${fileName}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.status(200).send(buffer);
  }

  private getContentTypeFromExtension(extension: string): string {
    const contentTypes: Record<string, string> = {
      avif: "image/avif",
      webp: "image/webp",
      png: "image/png",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      gif: "image/gif",
      ico: "image/x-icon",
      tiff: "image/tiff",
      bmp: "image/bmp"
    };
    return contentTypes[extension] || "application/octet-stream";
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
