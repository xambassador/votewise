"use client";

import type { SheetProps } from "@votewise/ui/sheet";

import Link from "next/link";
import { useFetchMembers } from "@/hooks/use-fetch-members";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Users as UsersIcon } from "@votewise/ui/icons/users";
import { Spinner } from "@votewise/ui/ring-spinner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@votewise/ui/sheet";

import { useMe } from "@/components/user-provider";

import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type Props = SheetProps & { groupId: string; name: string; about: string };

export function Members(props: Props) {
  const { groupId, name, about, ...rest } = props;

  return (
    <Sheet {...rest}>
      <SheetContent>
        <SheetHeader className="pb-5 border-b border-nobelBlack-200 mb-5">
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>{about}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 max-h-[calc(100vh-64px-145px-)] overflow-y-auto scroller">
          <div className="flex flex-col gap-5 border-b border-nobelBlack-200 pb-5">
            <h2 className="text-xl font-medium">Admins</h2>
            <Admins groupId={groupId} />
          </div>

          <div className="flex flex-col gap-5 border-b border-nobelBlack-200 pb-5">
            <h2 className="text-xl font-medium">Moderators</h2>
            <Moderators groupId={groupId} />
          </div>

          <div className="flex flex-col gap-5 border-b border-nobelBlack-200 pb-5">
            <h2 className="text-xl font-medium">Members</h2>
            <Users groupId={groupId} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const loader = (
  <div className="min-h-40 grid place-items-center">
    <Spinner className="mx-auto size-5" />
  </div>
);

function Admins(props: { groupId: string }) {
  const { groupId } = props;
  const { data, status, error } = useFetchMembers(groupId);
  switch (status) {
    case "pending":
      return loader;
    case "error":
      return (
        <div className="min-h-40 grid place-items-center">
          <span className="text-red-500">{error.message}</span>
        </div>
      );
  }

  const admins = data.members.filter((member) => member.role === "ADMIN");
  return (
    <ul className="flex flex-col gap-5">
      {admins.map((admin) => (
        <li key={admin.id} className="flex items-center w-full justify-between pr-2">
          <User
            name={admin.user.first_name + " " + admin.user.last_name}
            avatar={admin.user.avatar_url}
            username={admin.user.user_name}
          />
        </li>
      ))}
    </ul>
  );
}

function Moderators(props: { groupId: string }) {
  const { groupId } = props;
  const { data, status, error } = useFetchMembers(groupId);
  const me = useMe("Moderators");
  switch (status) {
    case "pending":
      return loader;
    case "error":
      return (
        <div className="min-h-40 grid place-items-center">
          <span className="text-red-500">{error.message}</span>
        </div>
      );
  }
  const moderators = data.members.filter((member) => member.role === "MODERATOR");

  if (moderators.length === 0) {
    return (
      <div>
        <UsersIcon className="text-gray-400 size-8 mx-auto" />
        <p className="text-center text-gray-400 mt-2">No moderators</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {moderators.map((moderator) => (
        <li key={moderator.id} className="flex items-center w-full justify-between pr-2">
          <User
            name={moderator.user.first_name + " " + moderator.user.last_name}
            avatar={moderator.user.avatar_url}
            username={moderator.user.user_name}
            isMe={me.id === moderator.user.id}
          />
        </li>
      ))}
    </ul>
  );
}

function Users(props: { groupId: string }) {
  const { groupId } = props;
  const { data, status, error } = useFetchMembers(groupId);
  const me = useMe("Users");
  switch (status) {
    case "pending":
      return loader;
    case "error":
      return (
        <div className="min-h-40 grid place-items-center">
          <span className="text-red-500">{error.message}</span>
        </div>
      );
  }
  const members = data.members.filter((member) => member.role === "MEMBER");

  if (members.length === 0) {
    return (
      <div>
        <UsersIcon className="text-gray-400 size-8 mx-auto" />
        <p className="text-center text-gray-400 mt-2">No members</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {members.map((member) => (
        <li key={member.id} className="flex items-center w-full justify-between pr-2">
          <User
            name={member.user.first_name + " " + member.user.last_name}
            avatar={member.user.avatar_url}
            username={member.user.user_name}
            isMe={me.id === member.user.id}
          />
        </li>
      ))}
    </ul>
  );
}

function User(props: { name: string; username: string; avatar: string; isMe?: boolean }) {
  const { name, username, avatar, isMe } = props;
  return (
    <div className={cn("flex gap-1 w-full", isMe && "border-r-2 border-blue-300")}>
      <Link
        href={routes.user.profile(username)}
        className="focus-presets focus-primary rounded-full"
        role="link"
        aria-label={"View " + name + "'s profile"}
      >
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback name={name} />
        </Avatar>
      </Link>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-300">
          <Link
            href={routes.user.profile(username)}
            className="focus-presets focus-primary rounded"
            role="link"
            aria-label={"View " + name + "'s profile"}
          >
            {name}
          </Link>
        </span>
        <span className="text-xs text-gray-400">
          <Link
            href={routes.user.profile(username)}
            className="focus-presets focus-primary rounded"
            role="link"
            aria-label={"View " + name + "'s profile"}
          >
            @{username}
          </Link>
        </span>
      </div>
    </div>
  );
}
