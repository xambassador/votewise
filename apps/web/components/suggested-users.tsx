import { Fragment, Suspense } from "react";

import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedUserCard from "@votewise/ui/cards/suggested-user";
import { ErrorBoundary } from "@votewise/ui/error-boundary";
import { AlertCircleSolid } from "@votewise/ui/icons/alert-circle-solid";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";
import { Spinner } from "@votewise/ui/ring-spinner";

import { getUserClient } from "@/lib/client.server";

const maxSuggestedUsers = 3;
const fallbackSpinner = (
  <div className="grid place-items-center h-24">
    <Spinner className="size-8" />
  </div>
);
const fallbackError = (
  <div className="grid place-items-center h-24">
    <div className="flex flex-col items-center gap-1">
      <AlertCircleSolid className="text-red-500" />
      <span className="text-sm text-red-500">Failed to load suggested users</span>
    </div>
  </div>
);

export function SuggestedUsers() {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-nobelBlack-200">
      <span className="text-sm font-medium text-gray-300">Suggested Users</span>
      <ErrorBoundary>
        <Suspense fallback={fallbackSpinner}>
          <SuggestedUsersList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

async function SuggestedUsersList() {
  const user = getUserClient();
  const result = await user.getRecommendateUsers();

  if (!result.success) return fallbackError;

  const suggestedUsers = result.data.users.slice(0, maxSuggestedUsers);
  const remainingSuggestedUsers = result.data.users.slice(maxSuggestedUsers);

  return (
    <Fragment>
      {suggestedUsers.map((user) => (
        <SuggestedUserCard.RecommendedUserCard userId={user.id} key={user.id}>
          <Avatar>
            <AvatarFallback name={user.first_name + " " + user.last_name} />
            <AvatarImage src={user.avatar_url} alt={user.first_name} />
          </Avatar>
          <div className="flex flex-col gap-1 flex-1">
            <SuggestedUserCard.RecommendedUserCardHeader>
              <SuggestedUserCard.UserName>{user.first_name}</SuggestedUserCard.UserName>
            </SuggestedUserCard.RecommendedUserCardHeader>
            <SuggestedUserCard.UserHandle title={user.user_name}>
              {truncateOnWord(user.user_name, 30)}
            </SuggestedUserCard.UserHandle>
          </div>
          <SuggestedUserCard.UserFollowButton />
        </SuggestedUserCard.RecommendedUserCard>
      ))}

      <MoreItemsWithSummary
        count={remainingSuggestedUsers.length}
        avatars={remainingSuggestedUsers.map((user) => ({
          name: user.first_name + " " + user.last_name,
          url: user.avatar_url
        }))}
      />
    </Fragment>
  );
}
