import { Comment } from "@votewise/ui/icons/comment";
import { Heart } from "@votewise/ui/icons/heart";
import { Users2 } from "@votewise/ui/icons/users";

type Props = {
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export function ProfileRelationStats(props: Props) {
  const { totalPosts, totalFollowers, totalFollowing } = props;
  return (
    <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
      <div>
        <span className="text-lg font-semibold text-blue-300 block">{totalPosts}</span>
        <span className="block text-gray-400 text-sm">Posts</span>
      </div>
      <div>
        <span className="text-lg font-semibold text-blue-300 block">{totalFollowers}</span>
        <span className="block text-gray-400 text-sm">Followers</span>
      </div>
      <div>
        <span className="text-lg font-semibold text-blue-300 block">{totalFollowing}</span>
        <span className="block text-gray-400 text-sm">Following</span>
      </div>
    </div>
  );
}

type ProfileActivityStatsProps = {
  totalComments: number;
  totalVotes: number;
  totalGroups: number;
};

export function ProfileActivityStats(props: ProfileActivityStatsProps) {
  const { totalComments, totalVotes, totalGroups } = props;
  return (
    <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
      <div className="flex items-center gap-2">
        <Comment className="text-black-200" />
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-300 text-lg">{totalComments}</span> comments
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Heart className="text-black-200" />
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-300 text-lg">{totalVotes}</span> votes
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Users2 className="text-black-200" />
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-300 text-lg">{totalGroups}</span> groups
        </p>
      </div>
    </div>
  );
}
