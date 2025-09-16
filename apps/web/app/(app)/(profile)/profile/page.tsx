import { MyProfileFetcher } from "./_components/profile-fetcher";
import { ProfileImage } from "./_components/profile-image";
import { ProfileInfo } from "./_components/profile-info";
import { ProfileActivityStats, ProfileRelationStats } from "./_components/profile-stats";

export default function Page() {
  return (
    <MyProfileFetcher>
      {(profile) => {
        const name = profile.first_name + " " + profile.last_name;
        return (
          <div className="flex flex-col gap-5">
            <ProfileImage name={name} avatarUrl={profile.avatar_url ?? ""} coverImage={profile.cover_image_url ?? ""} />
            <ProfileInfo
              name={name}
              userName={profile.user_name}
              about={profile.about ?? ""}
              joinedAt={profile.joined_at.toString()}
              location={profile.location}
              showFollowButton={false}
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
      }}
    </MyProfileFetcher>
  );
}
