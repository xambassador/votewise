"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { getSrcSet } from "./image-utils";
import { useIsHydrated } from "./use-is-hydrated";

type LoadingStatus = "loading" | "loaded" | "error" | "idle";

export function useImageLoadingStatus(src: string | undefined, width?: number, sizes?: string) {
  const isHydrated = useIsHydrated();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();

  const [status, setStatus] = useState<LoadingStatus>(() => loadingStatusFromImage(image, src, width, sizes));

  useLayoutEffect(() => {
    setStatus(loadingStatusFromImage(image, src, width, sizes));
  }, [image, src, width, sizes]);

  useLayoutEffect(() => {
    if (!image) return;
    const handleLoaded = () => setStatus("loaded");
    const handleError = () => setStatus("error");
    image.addEventListener("load", handleLoaded);
    image.addEventListener("error", handleError);
    // eslint-disable-next-line consistent-return
    return () => {
      image.removeEventListener("load", handleLoaded);
      image.removeEventListener("error", handleError);
    };
  }, [image]);

  return status;
}

function loadingStatusFromImage(
  image: HTMLImageElement | null,
  src?: string,
  width?: number,
  sizes?: string
): LoadingStatus {
  if (!image) return "idle";
  if (!src) return "error";
  const srcSets = getSrcSet(src, { width, sizes });
  if (image.src !== srcSets.url) {
    if (srcSets.sizes) image.sizes = srcSets.sizes;
    image.srcset = srcSets.srcSet;
    image.src = srcSets.url;
  }
  return image.complete && image.naturalHeight !== 0 ? "loaded" : "loading";
}
