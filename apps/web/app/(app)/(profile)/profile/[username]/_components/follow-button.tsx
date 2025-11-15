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
      <Button onClick={unFollow} loading={isLoading} variant="secondary">
        <UserMinus />
        Unfollow
      </Button>
    );
  }

  return (
    <Button onClick={follow} loading={isLoading}>
      <UserPlus />
      Follow
    </Button>
  );
}
