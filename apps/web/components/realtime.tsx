"use client";

import { useEffect, useRef, useState } from "react";

import { createContext } from "@votewise/ui/context";

import { WS } from "@/lib/ws";

const [Provider, useRealtime] = createContext<{ socket: WS | null }>("RealtimeProvider");
export { useRealtime };

export function Realtime(props: React.PropsWithChildren) {
  const [, forceUpdate] = useState(0);
  const socketRef = useRef<WS | null>(null);

  useEffect(() => {
    if (socketRef.current) return;
    socketRef.current = WS.init();
    forceUpdate((x) => x + 1);

    // eslint-disable-next-line consistent-return
    return () => {
      // Looks like the effect cleanup function is called before the connection is established
      // https://stackoverflow.com/questions/12487828/what-does-websocket-is-closed-before-the-connection-is-established-mean
      if (!socketRef.current?.isConnected()) {
        return;
      }
      socketRef.current?.close();
    };
  }, []);

  return <Provider socket={socketRef.current}>{props.children}</Provider>;
}
