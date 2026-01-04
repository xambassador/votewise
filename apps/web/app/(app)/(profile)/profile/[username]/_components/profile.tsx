"use client";

import type { GetUserProfileResponse } from "@votewise/client/user";

import { useFetchProfile } from "@/hooks/use-fetch-profile";

import { Error } from "@votewise/ui/error";

import { ProfileActivityStats, ProfileRelationStats } from "../../_components/profile-stats";
import { ProfileTabs } from "../../_components/profile-tabs";
import { ProfileImageSkeleton, ProfileInfoSkeleton } from "../../_components/skeleton";
import { ProfileImage } from "./profile-image";
import { ProfileInfo } from "./profile-info";

type Props = {
  profile: GetUserProfileResponse;
  username: string;
};

export function Profile(props: Props) {
  const { profile, username } = props;
  const { data, status, error } = useFetchProfile(username, profile);

  switch (status) {
    case "pending":
      return (
        <div className="flex flex-col gap-5">
          <ProfileImageSkeleton />
          <ProfileInfoSkeleton />
        </div>
      );
    case "error":
      return <Error error={error.message} />;
  }

  const name = data.first_name + " " + data.last_name;

  return (
    <div className="flex flex-col gap-5">
      <ProfileImage avatarUrl={profile.avatar_url ?? ""} coverImage={profile.cover_image_url ?? ""} name={name} />
      <ProfileInfo
        name={name}
        userName={profile.user_name}
        about={profile.about ?? ""}
        joinedAt={profile.joined_at.toString()}
        location={profile.location ?? ""}
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
      <ProfileTabs username={props.username} />
    </div>
  );
}
