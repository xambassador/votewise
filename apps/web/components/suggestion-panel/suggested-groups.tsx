import { Suspense } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedGroupCard from "@votewise/ui/cards/suggested-group";
import { ErrorBoundary } from "@votewise/ui/error-boundary";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";

import { getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { ContentWrapper, EmptyState, ErrorMessage, fallbackSpinner, maxListItems, Title, VerticalList } from "./utils";

const maxSuggestedGroups = maxListItems;
const fallbackError = (
  <ErrorMessage message="Our suggestion engine ran out of gas somewhere between the server and your screen." />
);

export function SuggestedGroups() {
  return (
    <ContentWrapper>
      <Title>Suggested Groups</Title>
      <ErrorBoundary>
        <Suspense fallback={fallbackSpinner}>
          <SuggestedGroupsList />
        </Suspense>
      </ErrorBoundary>
    </ContentWrapper>
  );
}

async function SuggestedGroupsList() {
  const user = getUserClient();
  const result = await user.getRecommendateGroups();
  if (!result.success) return fallbackError;

  const suggestedGroups = result.data.groups.slice(0, maxSuggestedGroups);
  const remainingSuggestedGroups = result.data.groups.slice(maxSuggestedGroups);

  if (suggestedGroups.length === 0) {
    return <EmptyState message="No suggestions!" />;
  }

  return (
    <VerticalList>
      {suggestedGroups.map((group) => (
        <SuggestedGroupCard.SuggestedGroupCard key={group.id}>
          <SuggestedGroupCard.Header>
            <div className="flex-1 flex gap-2">
              <Avatar className="rounded size-10">
                <AvatarFallback name={group.author ? group.author.first_name + group.author.last_name : ""} />
                <AvatarImage
                  src={group.author?.avatar_url || ""}
                  alt={group.author?.first_name}
                  className="overflow-clip-margin-unset object-cover"
                />
              </Avatar>
              <div className="flex flex-col">
                <SuggestedGroupCard.GroupName>
                  <Link href={routes.group.view(group.id)} className="focus-presets focus-primary rounded">
                    {group.name}
                  </Link>
                </SuggestedGroupCard.GroupName>
                <SuggestedGroupCard.GroupCreatorHandle>
                  <Link
                    href={routes.user.profile(group.author?.user_name || "")}
                    className="focus-presets focus-primary rounded"
                  >
                    {group.author?.user_name}
                  </Link>
                </SuggestedGroupCard.GroupCreatorHandle>
              </div>
            </div>
            <SuggestedGroupCard.GroupJoinButton
              aria-label={`Join ${group.name} group`}
              title={`Join ${group.name} group`}
            />
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
    </VerticalList>
  );
}
