import { useStore } from "zustand";

import Link from "next/link";

import React from "react";

import { SearchField, Skeleton, SkeletonContainer } from "@votewise/ui";
import {
  FiBell as Bell,
  FiUsers as Group,
  FiHome as Home,
  FiTrendingUp as Trending,
} from "@votewise/ui/icons";

import store from "lib/store";

import { Logo } from "./Logo";
import { UserPill } from "./UserPill";

function UserInfoBoxSkeleton() {
  return (
    <SkeletonContainer className="flex items-center">
      <Skeleton as="div" className="mr-2 h-12 w-12 rounded-full" />
      <Skeleton as="div" className="h-4 w-28 rounded-lg" />
    </SkeletonContainer>
  );
}

function UserInfoBox() {
  const user = useStore(store, (state) => state.user);
  const status = useStore(store, (state) => state.status);

  return (
    <>
      <button type="button">
        <Bell className="h-6 w-6 text-gray-800" />
      </button>
      {status === "loading" && <UserInfoBoxSkeleton />}
      {status === "success" && user && (
        <UserPill
          username={user.name}
          src={user.profile_image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"}
        />
      )}
    </>
  );
}

export function Navbar() {
  return (
    <nav className="bg-white py-5 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-[calc((155/16)*1rem)]">
        <Logo />

        <div className="flex gap-14">
          <ul className="flex items-center gap-4">
            {/* TODO: Make a component for nav links and add different styles based on selected link */}
            <li>
              <Link href="/" className="bg-black-900 flex items-center gap-2 rounded-full p-3 text-gray-50">
                <span>
                  <Home className="h-6 w-6 text-gray-50" />
                </span>
                <span className="font-medium text-gray-50">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/" className="inline-block rounded-full p-3 transition-all hover:bg-gray-50">
                <span>
                  <Trending className="h-6 w-6 text-gray-800" />
                </span>
              </Link>
            </li>
            <li>
              <Link href="/" className="inline-block rounded-full p-3 transition-all hover:bg-gray-50">
                <span>
                  <Group className="h-6 w-6 text-gray-800" />
                </span>
              </Link>
            </li>
          </ul>

          <SearchField
            name="search-query"
            placeholder="Search posts, user or group"
            className="w-[calc((500/16)*1rem)]"
          />
        </div>

        <div className="flex items-center gap-4">
          <UserInfoBox />
        </div>
      </div>
    </nav>
  );
}
