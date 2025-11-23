"use client";

import { useRouter } from "next/navigation";
import { useFollowUser } from "@/hooks/use-follow-user";

import { UserFollowButton } from "@votewise/ui/cards/suggested-user";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";

import { routes } from "@/lib/routes";

type Props = {
  name: string;
  username: string;
};

export function FollowUserButton(props: Props) {
  const { name, username } = props;
  const { isLoading, follow, isFollowing } = useFollowUser(username, false);
  if (isFollowing) return null;
  return (
    <UserFollowButton
      className="focus-visible rounded"
      aria-label={`Follow ${name}`}
      title={`Follow ${name}`}
      loading={isLoading}
      onClick={follow}
    />
  );
}

export function MoreItems(props: React.ComponentProps<typeof MoreItemsWithSummary>) {
  const router = useRouter();

  function handleClick() {
    router.push(routes.trending.root());
  }

  return <MoreItemsWithSummary {...props} onClick={handleClick} />;
}
