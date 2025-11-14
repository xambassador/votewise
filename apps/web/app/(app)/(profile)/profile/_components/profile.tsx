"use client";

import type { GetUserProfileResponse } from "@votewise/client/user";

import { useFetchProfile } from "@/hooks/use-fetch-profile";

import { Error } from "@votewise/ui/error";

import { ProfileImage } from "./profile-image";
import { ProfileInfo } from "./profile-info";
import { ProfileActivityStats, ProfileRelationStats } from "./profile-stats";

type Props = {
  profile: GetUserProfileResponse;
  username: string;
};

export function Profile(props: Props) {
  const { profile, username } = props;
  const { data, status, error } = useFetchProfile(username, profile);

  switch (status) {
    case "pending":
      return <div>Loading...</div>;
    case "error":
      return <Error error={error.message} />;
  }

  const name = data.first_name + " " + data.last_name;

  return (
    <div className="flex flex-col gap-5">
      <ProfileImage
        name={name}
        avatarUrl={profile.avatar_url ?? ""}
        coverImage={profile.cover_image_url ?? ""}
        about={profile.about ?? ""}
        firstName={data.first_name}
        lastName={data.last_name}
      />
      <ProfileInfo
        name={name}
        userName={profile.user_name}
        about={profile.about ?? ""}
        joinedAt={profile.joined_at.toString()}
        location={profile.location}
        showFollowButton
        selfFollow={profile.self_follow}
      />
      <ProfileRelationStats
        totalFollowers={profile.aggregation.total_followers}
        totalFollowing={profile.aggregation.total_following}
        totalPosts={profile.aggregation.total_posts}
      />
      <ProfileActivityStats
        totalComments={profile.aggregation.total_comments}
        totalGroups={profile.aggregation.total_groups}
        totalVotes={profile.aggregation.total_votes}
      />
    </div>
  );
}
