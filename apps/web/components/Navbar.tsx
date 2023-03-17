import { useStore } from "zustand";

import Link from "next/link";
import { useRouter } from "next/router";

import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

import { classNames } from "@votewise/lib";
import {
  Avatar,
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownTransition,
  SearchField,
  Skeleton,
  SkeletonContainer,
} from "@votewise/ui";
import {
  FiBell as Bell,
  FiUsers as Group,
  FiHome as Home,
  FiTrendingUp as Trending,
} from "@votewise/ui/icons";

import store from "lib/store";

import { Logo } from "./Logo";
import { Notification, NotificationActionPanel, NotificationContainer } from "./notification";
import { CommentedNotification } from "./notification/CommentedNotification";
import { FollowingNotification } from "./notification/FollowingNotification";
import { FriendRequestNotification } from "./notification/FriendRequestNotification";
import { GroupCommentNotification } from "./notification/GroupPostCommentNotification";
import { GroupPostUpvoteNotification } from "./notification/GroupPostUpvoteNotification";
import { JoinGroupNotification } from "./notification/JoinGroupNotification";
import { UpvotePostNotification } from "./notification/UpvotePostNotification";

function Notifications() {
  return (
    <NotificationContainer>
      <NotificationActionPanel />
      <Notification>
        <UpvotePostNotification />
      </Notification>
      <Notification>
        <CommentedNotification />
      </Notification>
      <Notification>
        <FollowingNotification />
      </Notification>
      <Notification>
        <FriendRequestNotification />
      </Notification>
      <Notification>
        <JoinGroupNotification />
      </Notification>
      <Notification>
        <GroupPostUpvoteNotification />
      </Notification>
      <Notification>
        <GroupCommentNotification />
      </Notification>
    </NotificationContainer>
  );
}

function NotificationButton() {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button type="button" className="rounded-full p-3 transition-all hover:bg-gray-50">
            <Bell className="h-6 w-6 text-gray-800" />
          </Popover.Button>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-[calc((420/16)*1rem)] max-w-[calc((420/16)*1rem)] -translate-x-1/2 transform px-4 sm:px-0">
              <Notifications />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

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
      <NotificationButton />
      {status === "loading" && <UserInfoBoxSkeleton />}
      {status === "success" && user && (
        <div className="flex items-center gap-2">
          <Avatar src={user.profile_image} alt="Avatar" width={48} height={48} rounded />
          <DropdownMenu>
            <DropdownButton>{user.name}</DropdownButton>
            <DropdownTransition>
              <DropdownMenuItems>
                <DropdownMenuItem className="flex flex-col items-start gap-[10px]">
                  <span>{user.email}</span>
                  <div className="w-full rounded-full border border-gray-200" />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/privacy">Privacy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button type="button">Signout</button>
                </DropdownMenuItem>
              </DropdownMenuItems>
            </DropdownTransition>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}

const links = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Groups",
    href: "/groups",
    icon: Group,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: Trending,
  },
];

export function Navbar() {
  const router = useRouter();
  return (
    <nav className="bg-white py-5 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-[calc((155/16)*1rem)]">
        <Logo />

        <div className="flex gap-14">
          <ul className="flex items-center gap-4">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={classNames(
                    router.pathname === link.href &&
                      "bg-black-900 flex items-center gap-2 rounded-full p-3 text-gray-50",
                    router.pathname !== link.href &&
                      "inline-block rounded-full p-3 transition-all hover:bg-gray-50"
                  )}
                >
                  <span>
                    {link.icon({
                      className: classNames(
                        "h-6 w-6",
                        router.pathname === link.href ? "text-gray-50" : "text-gray-800"
                      ),
                    })}
                  </span>
                  {router.pathname === link.href && (
                    <span className="font-medium text-gray-50">{link.name}</span>
                  )}
                </Link>
              </li>
            ))}
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
