"use client";

import type { EventData } from "@votewise/types";

import { useEffect, useState } from "react";
import { useSound } from "use-sound";

import { Badge } from "@votewise/ui/badge";
import { Bell } from "@votewise/ui/icons/bell";

import { routes } from "@/lib/routes";

import boop from "@/assets/sounds/boop.mp3";

import { Link } from "./link";
import { useRealtime } from "./realtime";

export function NotificationButton() {
  return (
    <Link href={routes.notification.root()} className="focus-visible rounded">
      <Bell className="text-inherit" />
      Notifications
      <UnreadBadge />
    </Link>
  );
}

function UnreadBadge() {
  const [count, setCount] = useState(0);
  const [play, { duration }] = useSound(boop, { volume: 0.25 });
  const { socket } = useRealtime("UnreadBadge");

  useEffect(() => {
    if (count > 0 && duration) {
      play();
    }
  }, [duration, play, count]);

  useEffect(() => {
    function onCount(data: EventData<"notificationCount">) {
      setCount(data.count);
    }

    socket?.on("notificationCount", onCount);
    return () => {
      socket?.off("notificationCount", onCount);
    };
  }, [socket]);

  if (count === 0) return null;
  return (
    <Badge className="rounded-full size-6" variant="secondary">
      {count}
    </Badge>
  );
}
