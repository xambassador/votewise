"use client";

import { usePathname } from "next/navigation";

import { NavTabButton, NavTabs } from "@/components/nav-tabs";

export function FeedTabs() {
  const pathname = usePathname();
  const isFeeds = pathname === "/" || pathname.includes("feeds");
  const isTrending = pathname.startsWith("/trending");
  return (
    <NavTabs>
      <NavTabButton isActive={isFeeds}>Discover</NavTabButton>
      <NavTabButton isActive={isTrending}>Trending</NavTabButton>
    </NavTabs>
  );
}
