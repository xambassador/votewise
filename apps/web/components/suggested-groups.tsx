import { Suspense } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedGroupCard from "@votewise/ui/cards/suggested-group";
import { ErrorBoundary } from "@votewise/ui/error-boundary";
import { AlertCircleSolid } from "@votewise/ui/icons/alert-circle-solid";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";
import { Spinner } from "@votewise/ui/ring-spinner";

import { getUserClient } from "@/lib/client.server";

const maxSuggestedGroups = 3;
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

export function SuggestedGroups() {
  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-nobelBlack-200">
      <span className="text-sm font-medium text-gray-300">Suggested Groups</span>
      <ErrorBoundary>
        <Suspense fallback={fallbackSpinner}>
          <SuggestedGroupsList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

async function SuggestedGroupsList() {
  const user = getUserClient();
  const result = await user.getRecommendateGroups();
  if (!result.success) return fallbackError;

  const suggestedGroups = result.data.groups.slice(0, maxSuggestedGroups);
  const remainingSuggestedGroups = result.data.groups.slice(maxSuggestedGroups);
  return (
    <div className="flex flex-col gap-4">
      {suggestedGroups.map((group) => (
        <SuggestedGroupCard.SuggestedGroupCard key={group.id}>
          <SuggestedGroupCard.Header>
            <div className="flex-1 flex gap-1">
              <Avatar className="rounded size-10">
                <AvatarFallback name={group.author ? group.author.first_name + group.author.last_name : ""} />
                <AvatarImage src={group.author?.avatar_url || ""} alt={group.author?.first_name} />
              </Avatar>
              <div className="flex flex-col">
                <SuggestedGroupCard.GroupName>{group.name}</SuggestedGroupCard.GroupName>
                <SuggestedGroupCard.GroupCreatorHandle>{group.author?.user_name}</SuggestedGroupCard.GroupCreatorHandle>
              </div>
            </div>
            <SuggestedGroupCard.GroupJoinButton />
          </SuggestedGroupCard.Header>
        </SuggestedGroupCard.SuggestedGroupCard>
      ))}

      <MoreItemsWithSummary
        count={remainingSuggestedGroups.length}
        avatars={remainingSuggestedGroups.map((group) => ({
          name: group.author?.first_name + " " + group.author?.last_name,
          url: group.author?.avatar_url || ""
        }))}
        avatarProps={{ className: "rounded" }}
      />
    </div>
  );
}
