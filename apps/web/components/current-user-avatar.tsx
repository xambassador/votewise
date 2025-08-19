"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";

import { cn } from "@/lib/cn";

import { useMe } from "./user-provider";

type Props = React.ComponentProps<typeof Avatar>;

export function CurrentUserAvatar(props: Props) {
  const { avatar_url, first_name, last_name } = useMe("UserProfile");
  return (
    <Avatar {...props} className={cn("size-12", props.className)}>
      <AvatarFallback name={first_name + " " + last_name} />
      <AvatarImage
        src={avatar_url}
        alt={first_name + " " + last_name}
        className="object-cover overflow-clip-margin-unset"
      />
    </Avatar>
  );
}
