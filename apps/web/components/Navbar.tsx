import Link from "next/link";

import React from "react";

import { SearchField } from "@votewise/ui";
import {
  FiBell as Bell,
  FiUsers as Group,
  FiHome as Home,
  FiTrendingUp as Trending,
} from "@votewise/ui/icons";

import { Logo } from "./Logo";
import { UserPill } from "./UserPill";

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
                  <Home stroke="#F3F4F6" />
                </span>
                <span className="font-medium text-gray-50">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/" className="inline-block rounded-full p-3 transition-all hover:bg-gray-50">
                <span>
                  <Trending />
                </span>
              </Link>
            </li>
            <li>
              <Link href="/" className="inline-block rounded-full p-3 transition-all hover:bg-gray-50">
                <span>
                  <Group />
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
          <button type="button">
            <Bell />
          </button>
          <UserPill
            username="Selma knight"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          />
        </div>
      </div>
    </nav>
  );
}
