import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Clock } from "@votewise/ui/icons/clock";
import { LocationPin } from "@votewise/ui/icons/location-pin";

import { FollowButton } from "./follow-button";

extend(relativeTime);

type BaseProps = {
  name: string;
  userName: string;
  about: string;
  location: string | null;
  joinedAt: string;
};
type Props = (BaseProps & { selfFollow: boolean; showFollowButton: true }) | (BaseProps & { showFollowButton: false });

export function ProfileInfo(props: Props) {
  const { name, userName, about, location, joinedAt, showFollowButton } = props;
  return (
    <div className="gap-4 flex flex-col pb-4 border-b border-nobelBlack-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-200">{name}</h1>
          <span className="text-base text-gray-400 font-medium">@{userName}</span>
        </div>
        {showFollowButton && <FollowButton username={userName} isFollowing={props.selfFollow} />}
      </div>
      <p className="text-base text-gray-300">{about}</p>
      <div>
        {location && (
          <div className="flex items-center gap-1 mb-1">
            <LocationPin className="text-black-200" />
            <span className="text-black-200 text-sm">{location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="text-black-200" />
          <span className="text-black-200 text-sm">Joined {dayjs(joinedAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
}
