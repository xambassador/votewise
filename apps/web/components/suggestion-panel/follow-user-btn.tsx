"use client";

import { useFollowUser } from "@/hooks/use-follow-user";

import { UserFollowButton } from "@votewise/ui/cards/suggested-user";

type Props = {
  name: string;
  username: string;
};

export function FollowUserButton(props: Props) {
  const { name, username } = props;
  const { isLoading, follow, isFollowing } = useFollowUser(username, false);
  if (isFollowing) return null;
  return (
    <UserFollowButton aria-label={`Follow ${name}`} title={`Follow ${name}`} loading={isLoading} onClick={follow} />
  );
}
