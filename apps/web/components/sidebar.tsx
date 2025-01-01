import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Bell } from "@votewise/ui/icons/bell";
import { Cog } from "@votewise/ui/icons/cog";
import { Home } from "@votewise/ui/icons/home";
import { Pencile } from "@votewise/ui/icons/pencile";
import { Search } from "@votewise/ui/icons/search";
import { User } from "@votewise/ui/icons/user";
import { Users } from "@votewise/ui/icons/users";

export function Sidebar() {
  return (
    <aside className="flex-1 max-w-[calc((200/16)*1rem)] border-r border-nobelBlack-200 pt-7">
      <div className="flex flex-col gap-6">
        <div className="pl-2 pr-1">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
            <AvatarImage src="/votewise-bucket/votewise/assets/avatars/default_avatar.png" alt="John doe" />
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
          <Button className="w-fit gap-1">
            <Pencile className="text-gray-200" />
            <span>Share Idea</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
