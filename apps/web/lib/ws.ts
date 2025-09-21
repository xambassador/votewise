"use client";

import type { EventData, EventNames } from "@votewise/types";

import { EventDeserializer } from "@votewise/event";

function getWebSocketURL(): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  return `${protocol}://${host}/api/realtime`;
}

export class WS {
  private static _instance: WS | null = null;
  private static instance: WebSocket | null = null;
  private static readonly eventDeserializer = new EventDeserializer();
  private static listeners: { [key in EventNames]?: ((data: EventData<key>) => void)[] } = {};

  static init(): WS {
    if (!WS._instance) {
      WS.instance = new WebSocket(getWebSocketURL());
      WS._instance = new WS();
      WS.registerEventListener();
    }

    return WS._instance;
  }

  static getInstance(): WS | null {
    return WS._instance;
  }

  public close() {
    if (WS.instance) {
      WS.instance.close();
      WS.registerEventListener();
    }
  }

  public isConnected(): boolean {
    return WS.instance?.readyState === WebSocket.OPEN;
  }

  public send(data: string) {
    if (WS.instance && WS.instance.readyState === WebSocket.OPEN) {
      WS.instance.send(data);
    }
  }

  public onOpen(callback: (event: Event) => void) {
    if (WS.instance) {
      WS.instance.onopen = callback;
    }
  }

  public onClose(callback: (event: CloseEvent) => void) {
    if (WS.instance) {
      WS.instance.onclose = callback;
    }
  }

  public onError(callback: (event: Event) => void) {
    if (WS.instance) {
      WS.instance.onerror = callback;
    }
  }

  private static registerEventListener() {
    if (!WS.instance) return;
    WS.instance.onmessage = (event: MessageEvent) => {
      const deserializedEvent = WS.eventDeserializer.deserialize(event.data);
      if (!deserializedEvent.success) {
        return;
      }
      switch (deserializedEvent.data.event) {
        case "connected": {
          const listeners = WS.listeners.connected;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) => listener(deserializedEvent.data as EventData<"connected">));
          }
          break;
        }
        case "groupInviteNotification": {
          const listeners = WS.listeners.groupInviteNotification;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) => listener(deserializedEvent.data as EventData<"groupInviteNotification">));
          }
          break;
        }
        case "groupJoinNotification": {
          const listeners = WS.listeners.groupJoinNotification;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) => listener(deserializedEvent.data as EventData<"groupJoinNotification">));
          }
          break;
        }
        case "groupJoinRequestNotification": {
          const listeners = WS.listeners.groupJoinRequestNotification;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) =>
              listener(deserializedEvent.data as EventData<"groupJoinRequestNotification">)
            );
          }
          break;
        }
        case "notificationCount": {
          const listeners = WS.listeners.notificationCount;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) => listener(deserializedEvent.data as EventData<"notificationCount">));
          }
          break;
        }
        case "ping": {
          const listeners = WS.listeners.ping;
          if (listeners && listeners.length > 0) {
            listeners.forEach((listener) => listener(deserializedEvent.data as EventData<"ping">));
          }
          break;
        }
      }
    };
  }

  public on<K extends EventNames>(eventName: K, callback: (data: EventData<K>) => void) {
    WS.listeners[eventName] = WS.listeners[eventName] || [];
    WS.listeners[eventName].push(callback);
  }

  public off<K extends EventNames>(eventName: K, callback: (data: EventData<K>) => void) {
    if (!WS.listeners[eventName]) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    WS.listeners[eventName] = WS.listeners[eventName]?.filter((listener) => listener !== callback);
  }

  public static removeAllListeners() {
    if (WS.instance) {
      WS.instance.onmessage = null;
      WS.instance.onopen = null;
      WS.instance.onclose = null;
      WS.instance.onerror = null;
      WS.listeners = {};
    }
  }
}
