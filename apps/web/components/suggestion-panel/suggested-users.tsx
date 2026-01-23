import { Fragment, Suspense } from "react";
import Link from "next/link";

import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedUserCard from "@votewise/ui/cards/suggested-user";
import { ErrorBoundary } from "@votewise/ui/error-boundary";

import { getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { FollowUserButton, MoreItems } from "./follow-user-btn";
import { ContentWrapper, EmptyState, ErrorMessage, fallbackSpinner, maxListItems, Title } from "./utils";

const maxSuggestedUsers = maxListItems;
const fallbackError = (
  <ErrorMessage message=" Our AI tried to find your perfect matches but got distracted by cat videos instead." />
);

export function SuggestedUsers() {
  return (
    <ContentWrapper>
      <Title>Suggested Users</Title>
      <ErrorBoundary>
        <Suspense fallback={fallbackSpinner}>
          <SuggestedUsersList />
        </Suspense>
      </ErrorBoundary>
    </ContentWrapper>
  );
}

async function SuggestedUsersList() {
  const user = getUserClient();
  const result = await user.getRecommendateUsers({ top_n: 10 });

  if (!result.success) return fallbackError;

  const suggestedUsers = result.data.users.slice(0, maxSuggestedUsers);
  const remainingSuggestedUsers = result.data.users.slice(maxSuggestedUsers);

  if (suggestedUsers.length === 0) {
    return <EmptyState message="No suggestions!" />;
  }

  return (
    <Fragment>
      {suggestedUsers.map((user) => (
        <SuggestedUserCard.RecommendedUserCard userId={user.id} key={user.id}>
          <Link href={routes.user.profile(user.user_name)} className="focus-visible rounded-full">
            <Avatar>
              <AvatarFallback name={user.first_name + " " + user.last_name} />
              <AvatarImage src={user.avatar_url} alt={user.first_name} sizes="48px" />
            </Avatar>
          </Link>
          <div className="flex flex-col gap-1 flex-1">
            <SuggestedUserCard.RecommendedUserCardHeader>
              <SuggestedUserCard.UserName>
                <Link href={routes.user.profile(user.user_name)} className="focus-visible">
                  {user.first_name}
                </Link>
              </SuggestedUserCard.UserName>
            </SuggestedUserCard.RecommendedUserCardHeader>
            <SuggestedUserCard.UserHandle title={user.user_name}>
              <Link href={routes.user.profile(user.user_name)} className="focus-visible">
                {truncateOnWord(user.user_name, 30)}
              </Link>
            </SuggestedUserCard.UserHandle>
          </div>
          <FollowUserButton username={user.user_name} name={user.first_name + " " + user.last_name} />
        </SuggestedUserCard.RecommendedUserCard>
      ))}

      <MoreItems
        avatars={remainingSuggestedUsers.slice(0, 5).map((user) => ({
          name: user.first_name + " " + user.last_name,
          url: user.avatar_url,
          username: user.user_name
        }))}
      />
    </Fragment>
  );
}
