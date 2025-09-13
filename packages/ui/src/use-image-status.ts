"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useIsHydrated } from "./use-is-hydrated";

type LoadingStatus = "loading" | "loaded" | "error" | "idle";

export function useImageLoadingStatus(src: string | undefined) {
  const isHydrated = useIsHydrated();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();

  const [status, setStatus] = useState<LoadingStatus>(() => loadingStatusFromImage(image, src));

  useLayoutEffect(() => {
    setStatus(loadingStatusFromImage(image, src));
  }, [image, src]);

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

function loadingStatusFromImage(image: HTMLImageElement | null, src?: string): LoadingStatus {
  if (!image) return "idle";
  if (!src) return "error";
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalHeight !== 0 ? "loaded" : "loading";
}
