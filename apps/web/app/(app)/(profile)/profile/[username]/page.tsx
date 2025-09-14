import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { Clock } from "@votewise/ui/icons/clock";
import { Comment } from "@votewise/ui/icons/comment";
import { Heart } from "@votewise/ui/icons/heart";
import { LocationPin } from "@votewise/ui/icons/location-pin";
import { UserPlus } from "@votewise/ui/icons/user-plus";
import { Users2 } from "@votewise/ui/icons/users";
import { Image } from "@votewise/ui/image";

import { getUserClient } from "@/lib/client.server";

extend(relativeTime);

type Props = { params: { username: string } };

export default async function Page(props: Props) {
  const { username } = props.params;
  const userClient = getUserClient();
  const profileRes = await userClient.getUser(username);

  if (!profileRes.success) {
    return <Error error={profileRes.error} />;
  }

  const profile = profileRes.data;

  const name = profile.first_name + " " + profile.last_name;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mb-10">
        <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
          <Image className="size-full object-cover" src={profile.cover_image_url ?? ""} alt={name} />
        </figure>
        <Avatar className="size-20 absolute -bottom-10 left-5">
          <AvatarImage src={profile.avatar_url ?? ""} alt={name} className="object-cover overflow-clip-margin-unset" />
          <AvatarFallback name={name} />
        </Avatar>
      </div>

      <div className="gap-4 flex flex-col pb-4 border-b border-nobelBlack-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-200">{name}</h1>
            <span className="text-base text-gray-400 font-medium">@{profile.user_name}</span>
          </div>
          <Button>
            <UserPlus />
            Follow
          </Button>
        </div>
        <p className="text-base text-gray-300">{profile.about}</p>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <LocationPin className="text-black-200" />
            <span className="text-black-200 text-sm">{profile.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="text-black-200" />
            <span className="text-black-200 text-sm">Joined {dayjs(profile.joined_at).fromNow()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
        <div>
          <span className="text-lg font-semibold text-blue-300 block">{profile.aggregation.total_posts}</span>
          <span className="block text-gray-400 text-sm">Posts</span>
        </div>
        <div>
          <span className="text-lg font-semibold text-blue-300 block">{profile.aggregation.total_followers}</span>
          <span className="block text-gray-400 text-sm">Followers</span>
        </div>
        <div>
          <span className="text-lg font-semibold text-blue-300 block">{profile.aggregation.total_following}</span>
          <span className="block text-gray-400 text-sm">Following</span>
        </div>
      </div>

      <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
        <div className="flex items-center gap-2">
          <Comment className="text-black-200" />
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-300 text-lg">{profile.aggregation.total_comments}</span> comments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="text-black-200" />
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-300 text-lg">{profile.aggregation.total_votes}</span> votes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users2 className="text-black-200" />
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-blue-300 text-lg">{profile.aggregation.total_groups}</span> groups
          </p>
        </div>
      </div>
    </div>
  );
}
