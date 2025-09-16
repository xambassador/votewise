"use client";

import { useFollowUser } from "@/hooks/use-follow-user";

import { Button } from "@votewise/ui/button";
import { UserMinus } from "@votewise/ui/icons/user-minus";
import { UserPlus } from "@votewise/ui/icons/user-plus";

export function FollowButton(props: { username: string; isFollowing: boolean }) {
  const { username, isFollowing: defaultIsFollowing } = props;
  const { follow, isFollowing, isLoading, unFollow } = useFollowUser(username, defaultIsFollowing);

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
