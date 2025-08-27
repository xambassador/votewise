"use client";

import { useCallback, useRef, useState } from "react";

export function useLazyLoad(props?: { requiredForceUpdate?: boolean }) {
  const isLoadedRef = useRef(false);
  const [, forceUpdate] = useState(0);

  const isLoaded = useCallback(() => isLoadedRef.current, []);
  const trigger = useCallback(() => {
    isLoadedRef.current = true;
    if (props?.requiredForceUpdate) {
      forceUpdate((x) => x + 1);
    }
  }, [props?.requiredForceUpdate]);

  return { trigger, isLoaded };
}
