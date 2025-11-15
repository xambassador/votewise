import { MyProfileFetcher } from "./_components/profile-fetcher";
import { ProfileImage } from "./_components/profile-image";
import { ProfileInfo } from "./_components/profile-info";
import { ProfileActivityStats, ProfileRelationStats } from "./_components/profile-stats";

export default function Page() {
  return (
    <MyProfileFetcher>
      {(profile) => (
        <div className="flex flex-col gap-5">
          <ProfileImage profile={profile} />
          <ProfileInfo profile={profile} />
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
      )}
    </MyProfileFetcher>
  );
}
