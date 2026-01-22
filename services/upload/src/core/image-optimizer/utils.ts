import { createHash } from "node:crypto";

import { CACHE_VERSION, getExtensionFromContentType } from "./config";

function getHash(items: (string | number | Buffer)[]): string {
  const hash = createHash("sha256");

  for (const item of items) {
    if (typeof item === "number") {
      hash.update(String(item));
    } else if (Buffer.isBuffer(item)) {
      hash.update(new Uint8Array(item));
    } else {
      hash.update(item);
    }
  }

  return hash.digest("base64url");
}

export function getImageEtag(buffer: Buffer): string {
  return getHash([buffer]);
}

export function getCacheKey(params: { url: string; width: number; quality: number; mimeType: string }): string {
  const { url, width, quality, mimeType } = params;
  return getHash([CACHE_VERSION, url, width, quality, mimeType]);
}

export function extractEtag(etag: string | null | undefined, buffer: Buffer): string {
  if (etag) {
    return Buffer.from(etag).toString("base64url");
  }
  return getImageEtag(buffer);
}

export function getSupportedMimeType(formats: string[], accept: string = ""): string {
  if (!accept) {
    return "";
  }

  const acceptedTypes = accept
    .split(",")
    .map((part) => {
      const [type, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return { type: type?.trim() ?? "", q };
    })
    .filter((item) => item.type !== "")
    .sort((a, b) => b.q - a.q);

  for (const format of formats) {
    for (const { type } of acceptedTypes) {
      if (type === format || type === "*/*" || (type.endsWith("/*") && format.startsWith(type.slice(0, -1)))) {
        return format;
      }
    }
  }

  return "";
}

export function getFileNameWithExtension(url: string, contentType: string | null): string {
  const urlPath = url.split("?")[0] ?? "";
  const originalName = urlPath.split("/").pop() || "image";
  const nameParts = originalName.split(".");
  const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join(".") : originalName;
  const extension = getExtensionFromMimeType(contentType);
  return extension ? `${baseName}.${extension}` : originalName;
}

function getExtensionFromMimeType(mimeType: string | null): string | null {
  if (!mimeType) return null;
  return getExtensionFromContentType(mimeType);
}
