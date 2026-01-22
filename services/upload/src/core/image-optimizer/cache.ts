import type { CachedImageValue, CacheEntry, ImageConfigComplete } from "./types";

import fs from "node:fs/promises";
import path from "node:path";

import { getCacheKey } from "./utils";

const DEFAULT_CACHE_DIR_NAME = "bucket";

// {maxAge}.{expireAt}.{etag}.{upstreamEtag}.{extension}
interface CacheFileInfo {
  maxAge: number;
  expireAt: number;
  etag: string;
  upstreamEtag: string;
  extension: string;
}

function parseCacheFileName(fileName: string): CacheFileInfo | null {
  const parts = fileName.split(".");
  if (parts.length < 5) {
    return null;
  }

  const extension = parts.pop()!;
  const upstreamEtag = parts.pop()!;
  const etag = parts.pop()!;
  const expireAt = parseInt(parts.pop()!, 10);
  const maxAge = parseInt(parts.pop()!, 10);

  if (isNaN(maxAge) || isNaN(expireAt)) {
    return null;
  }

  return { maxAge, expireAt, etag, upstreamEtag, extension };
}

function generateCacheFileName(info: CacheFileInfo): string {
  return `${info.maxAge}.${info.expireAt}.${info.etag}.${info.upstreamEtag}.${info.extension}`;
}

export class ImageOptimizerCache {
  private readonly cacheDir: string;
  private readonly config: ImageConfigComplete;

  constructor(options: { uploadsDir: string; config: ImageConfigComplete }) {
    this.cacheDir = path.join(options.uploadsDir, DEFAULT_CACHE_DIR_NAME);
    this.config = options.config;
  }

  public getCacheDir(): string {
    return this.cacheDir;
  }

  public static getCacheKey(params: { url: string; width: number; quality: number; mimeType: string }): string {
    return getCacheKey(params);
  }

  public async get(cacheKey: string): Promise<CacheEntry | null> {
    const cacheKeyDir = path.join(this.cacheDir, cacheKey);

    try {
      const files = await fs.readdir(cacheKeyDir);

      if (files.length === 0) {
        return null;
      }

      // most recent file
      const cacheFile = files[0];
      if (!cacheFile) {
        return null;
      }

      const fileInfo = parseCacheFileName(cacheFile);
      if (!fileInfo) {
        await this.deleteDir(cacheKeyDir);
        return null;
      }

      const now = Date.now();
      const isStale = now >= fileInfo.expireAt;

      const filePath = path.join(cacheKeyDir, cacheFile);
      const buffer = await fs.readFile(filePath);

      return {
        value: {
          buffer,
          extension: fileInfo.extension,
          etag: fileInfo.etag,
          upstreamEtag: fileInfo.upstreamEtag
        },
        expireAt: fileInfo.expireAt,
        maxAge: fileInfo.maxAge,
        isStale
      };
    } catch (error) {
      return null;
    }
  }

  public async set(
    cacheKey: string,
    value: CachedImageValue,
    maxAge: number = this.config.minimumCacheTTL
  ): Promise<void> {
    const cacheKeyDir = path.join(this.cacheDir, cacheKey);
    const expireAt = Date.now() + maxAge * 1000;

    const fileInfo: CacheFileInfo = {
      maxAge,
      expireAt,
      etag: value.etag,
      upstreamEtag: value.upstreamEtag,
      extension: value.extension
    };

    const fileName = generateCacheFileName(fileInfo);
    const filePath = path.join(cacheKeyDir, fileName);

    try {
      await this.deleteDir(cacheKeyDir);
      await fs.mkdir(cacheKeyDir, { recursive: true });
      await fs.writeFile(filePath, new Uint8Array(value.buffer));
    } catch {
      // --
    }
  }

  private async deleteDir(dirPath: string): Promise<void> {
    await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {});
  }
}
