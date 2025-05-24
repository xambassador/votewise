import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Bell } from "@votewise/ui/icons/bell";
import { Cog } from "@votewise/ui/icons/cog";
import { Home } from "@votewise/ui/icons/home";
import { Search } from "@votewise/ui/icons/search";
import { User } from "@votewise/ui/icons/user";
import { Users } from "@votewise/ui/icons/users";

import { CreatePostDialog } from "./create-post-dialog";

type Props = {
  name: string;
  avatarUrl: string;
};

export function Sidebar(props: Props) {
  const { name, avatarUrl } = props;
  return (
    <aside className="flex-1 sidebar-max-width border-r border-nobelBlack-200 pt-7 max-h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        <div className="pl-2 pr-1">
          <Avatar>
            <AvatarFallback name={name} />
            <AvatarImage className="object-cover" src={avatarUrl} alt={name} />
          </Avatar>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 pr-1">
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <Home className="text-blue-200" />
              <span className="text-sm font-medium text-blue-200">Home</span>
            </Link>
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <Users className="text-black-200" />
              <span className="text-sm font-medium text-black-200">Groups</span>
            </Link>
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <Search className="text-black-200" />
              <span className="text-sm font-medium text-black-200">Search</span>
            </Link>
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <Bell className="text-black-200" />
              <span className="text-sm font-medium text-black-200">Notifications</span>
            </Link>
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <User className="text-black-200" />
              <span className="text-sm font-medium text-black-200">Profile</span>
            </Link>
            <Link
              href="/"
              className="py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors"
            >
              <Cog className="text-black-200" />
              <span className="text-sm font-medium text-black-200">Settings</span>
            </Link>
          </div>
          <CreatePostDialog />
        </div>
      </div>
    </aside>
  );
}
