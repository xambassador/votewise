import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";

import { humanizeNumber } from "@/lib/humanize";
import { routes } from "@/lib/routes";
import { getFullName } from "@/lib/string";

type Props = {
  user: {
    user_name: string;
    avatar_url: string | null;
    about: string | null;
    first_name: string;
    last_name: string;
    aggregates: { total_followers: number; total_posts: number };
  };
};

export function UserCard(props: Props) {
  const { user } = props;
  return (
    <Link
      href={routes.user.profile(user.user_name)}
      className="focus-visible rounded-xl block"
      role="link"
      aria-label={"View " + getFullName(user) + "'s profile"}
    >
      <div className="p-5 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200">
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarImage src={user.avatar_url || ""} alt={getFullName(user)} />
            <AvatarFallback name={getFullName(user)} />
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-x-2 mb-1 flex-wrap">
              <span className="text-base font-semibold text-gray-300">{getFullName(user)}</span>
              <span className="text-gray-400 text-base">@{user.user_name}</span>
            </div>
            <p className="text-gray-300 text-base mb-4">{user.about}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_followers)}</span>
                  <span className="text-gray-400"> followers</span>
                </div>
                <div>
                  <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_posts)}</span>
                  <span className="text-gray-400"> posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
