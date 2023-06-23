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
  DropdownMenuItemsGroup,
  DropdownTransition,
  Loader,
  SearchField,
} from "@votewise/ui";
import {
  FiBell as Bell,
  FiUsers as Group,
  FiHome as Home,
  FiTrendingUp as Trending,
} from "@votewise/ui/icons";

import { useAsync } from "lib/hooks/useAsync";
import { useMyDetails } from "lib/hooks/useMyDetails";

import { signout } from "services/auth";

import { Logo } from "./Logo";
import { Notification, NotificationActionPanel, NotificationContainer } from "./notification";
import { CommentedNotification } from "./notification/CommentedNotification";
import { FollowingNotification } from "./notification/FollowingNotification";
import { FriendRequestNotification } from "./notification/FriendRequestNotification";
import { GroupCommentNotification } from "./notification/GroupPostCommentNotification";
import { GroupPostUpvoteNotification } from "./notification/GroupPostUpvoteNotification";
import { JoinGroupNotification } from "./notification/JoinGroupNotification";
import { UpvotePostNotification } from "./notification/UpvotePostNotification";
import { UserPillSkeleton } from "./skeletons/UserInfoSkeleton";

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
    name: "Trending",
    href: "/trending",
    icon: Trending,
  },
];

const userLinks = [
  {
    name: "Profile",
    href: "/profile",
  },
  {
    name: "Settings",
    href: "/settings",
  },
  {
    name: "Privacy",
    href: "/privacy",
  },
];

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
          <Popover.Button type="button" className="rounded-full p-3 transition-all hover:bg-gray-200">
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

function SignoutButton() {
  const router = useRouter();

  const { run, status } = useAsync({
    status: "idle",
    data: null,
    error: null,
  });

  const handleOnClick = () => {
    const promise = signout();
    run(promise, () => {
      router.push("/signin");
    });
  };

  return (
    <button
      type="button"
      className="flex items-center"
      onClick={handleOnClick}
      disabled={status === "pending"}
    >
      <span className="mr-2">{status === "pending" ? "Signing out..." : "Sign out"}</span>
      {status === "pending" && <Loader className="h-3 w-3" loaderColor="#238BE6" />}
    </button>
  );
}

function UserInfoBox() {
  const { status, data } = useMyDetails();

  return (
    <>
      <NotificationButton />
      {status === "loading" && <UserPillSkeleton />}
      {status === "success" && data.data.user && (
        <div className="flex items-center gap-2">
          <Avatar
            src={data.data.user.profile_image}
            className="border-2 border-gray-700 bg-blue-500"
            alt="Avatar"
            width={48}
            height={48}
            rounded
          />
          <DropdownMenu>
            <DropdownButton>{data.data.user.name}</DropdownButton>
            <DropdownTransition>
              <DropdownMenuItems>
                <DropdownMenuItemsGroup>
                  <DropdownMenuItem>
                    <span>{data.data.user.email}</span>
                  </DropdownMenuItem>
                </DropdownMenuItemsGroup>
                <DropdownMenuItemsGroup>
                  <div className="w-full rounded-full border border-gray-200" />
                </DropdownMenuItemsGroup>
                <DropdownMenuItemsGroup>
                  {userLinks.map((link) => (
                    <DropdownMenuItem key={link.name}>
                      {({ close }) => (
                        <Link href={link.href} onClick={() => close()}>
                          {link.name}
                        </Link>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem>
                    <SignoutButton />
                  </DropdownMenuItem>
                </DropdownMenuItemsGroup>
              </DropdownMenuItems>
            </DropdownTransition>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}

export function Navbar() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white py-5 shadow-sm">
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
                      "inline-block rounded-full p-3 transition-colors duration-200 ease-in-out hover:bg-gray-200"
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
