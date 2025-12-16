"use client";

import type { EventData } from "@votewise/types";

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useSound } from "use-sound";

import { Badge } from "@votewise/ui/badge";
import { Bell } from "@votewise/ui/icons/bell";

import { routes } from "@/lib/routes";

import boop from "@/assets/sounds/boop.mp3";

import { Link } from "./link";
import { useRealtime } from "./realtime";

export function NotificationButton(props: Omit<React.ComponentProps<typeof Link>, "href">) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  return (
    <Link {...props} href={routes.notification.root()} className="focus-visible rounded">
      <Bell className="text-inherit" />
      {isMobile ? "Notifications" : <span className="hidden xl:inline-block">Notifications</span>}
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
