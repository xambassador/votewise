"use client";

import { useFollowUser } from "@/hooks/use-follow-user";

import { Button } from "@votewise/ui/button";
import { UserMinus } from "@votewise/ui/icons/user-minus";
import { UserPlus } from "@votewise/ui/icons/user-plus";

import { useMe } from "@/components/user-provider";

export function FollowButton(props: { username: string; isFollowing: boolean }) {
  const { username, isFollowing: defaultIsFollowing } = props;
  const { follow, isFollowing, isLoading, unFollow } = useFollowUser(username, defaultIsFollowing);
  const { user_name } = useMe("FollowButton");

  if (username === user_name) {
    return null;
  }

  if (isFollowing) {
    return (
      <Button onClick={unFollow} loading={isLoading} variant="secondary" className="sm:h-10 h-8 px-2 sm:px-5">
        <UserMinus />
        <span className="hidden sm:inline-block">Unfollow</span>
      </Button>
    );
  }

  return (
    <Button onClick={follow} loading={isLoading} className="sm:h-10 h-8 px-2 sm:px-5">
      <UserPlus />
      <span className="hidden sm:inline-block">Follow</span>
    </Button>
  );
}
