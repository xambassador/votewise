"use client";

import type { IntersectionOptions } from "react-intersection-observer";

import { useEffect } from "react";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useInView } from "react-intersection-observer";

type Props = IntersectionOptions & { onInView?: (inView: boolean) => void };

/**
 * InView component tells if it is in the viewport or not. Use it for infinite scroll or lazy loading.
 */
export function InView(props: Props) {
  const { onInView, ...rest } = props;
  const onInViewCallback = useCallbackRef(onInView);
  const { ref, inView } = useInView(rest);

  useEffect(() => {
    onInViewCallback?.(inView);
  }, [inView, onInViewCallback]);

  return <div ref={ref} className="h-0" data-in-view={inView} />;
}
