import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as SuggestedUserCard from "@votewise/ui/cards/suggested-user";
import { MoreItemsWithSummary } from "@votewise/ui/more-items";

const suggestedUser = [
  {
    id: "user_1",
    name: "Justin James",
    handle: "@j_james",
    bio: "Cool kid in vintage town. Cool kid in vintage town. Cool kid in vintage town. Cool kid in vintage town. Cool kid in vintage town.",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_19.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=4447f0126836b8175ae09ea5fa6b9ce3f1942595ee0b123ecb282495f07d732a"
  },
  {
    id: "user_2",
    name: "Kenny James",
    handle: "@k_james",
    bio: "Old school in a new world",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_18.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=88f4e96886be74e0380fa8982983c683cf20ed88c06c9d0856317e8f58354854"
  },
  {
    id: "user_3",
    name: "Sara O'connor",
    handle: "@s_oconnor",
    bio: "Get to know me",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_21.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=004cebf20ebc322f2f69f0180ff95b1eebbf8dc02d60fbf6867dc9717c5a1598"
  },
  {
    id: "user_4",
    name: "Cara O'connor",
    handle: "@c_oconnor",
    bio: "The world is my oyster",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_30.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=64c236f7ec12f4f11d46530099a6995fa93de2d80d145fe4a34ded36d8b329d2"
  },
  {
    id: "user_5",
    name: "Cara O'connor",
    handle: "@c_oconnor",
    bio: "The world is my oyster",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_31.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=82f227d58d03cebcf79cbedaec73adb50b9b954f93717ef32a268663f6a00f77"
  },
  {
    id: "user_6",
    name: "Cara O'connor",
    handle: "@c_oconnor",
    bio: "The world is my oyster",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_32.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=8868141ef553d682cdb8a6e402c9b0e81b8e6f0398023101e901eaae426894a8"
  },
  {
    id: "user_6",
    name: "Cara O'connor",
    handle: "@c_oconnor",
    bio: "The world is my oyster",
    avatar:
      "http://minio.votewise.orb.local:9000/avatars/avatar_33.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ZVB9lMyse6x1YBz8kHQz%2F20241229%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241229T061036Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=3065fd965cb2eb5b8dbb7adbe42d841a5de2611b22ceb411ebdfefaa235cd9c3"
  }
];

export function SuggestedUsers() {
  const maxSuggestedUsers = 3;
  const suggestedUsers = suggestedUser.slice(0, maxSuggestedUsers);
  const remainingSuggestedUsers = suggestedUser.slice(maxSuggestedUsers);

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-nobelBlack-200">
      <span className="text-sm font-medium text-gray-300">Suggested Users</span>
      {suggestedUsers.map((user) => (
        <SuggestedUserCard.RecommendedUserCard userId={user.id} key={user.id}>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
            <AvatarImage src={user.avatar} alt={user.name} />
          </Avatar>
          <div className="flex flex-col gap-1 flex-1">
            <SuggestedUserCard.RecommendedUserCardHeader>
              <SuggestedUserCard.UserName>{user.name}</SuggestedUserCard.UserName>
              <SuggestedUserCard.UserHandle>{user.handle}</SuggestedUserCard.UserHandle>
            </SuggestedUserCard.RecommendedUserCardHeader>
            <SuggestedUserCard.UserBio>{truncateOnWord(user.bio, 50)}</SuggestedUserCard.UserBio>
          </div>
          <SuggestedUserCard.UserFollowButton />
        </SuggestedUserCard.RecommendedUserCard>
      ))}

      <MoreItemsWithSummary
        count={remainingSuggestedUsers.length}
        avatars={remainingSuggestedUsers.map((user) => ({ name: user.name, url: user.avatar }))}
      />
    </div>
  );
}
