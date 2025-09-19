"use client";

import { useEffect, useRef } from "react";

import { WS } from "@/lib/ws";

export function Realtime(props: React.PropsWithChildren) {
  const socketRef = useRef<WS | null>(null);

  useEffect(() => {
    if (socketRef.current) return;
    socketRef.current = WS.init();
    // eslint-disable-next-line consistent-return
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return <>{props.children}</>;
}
