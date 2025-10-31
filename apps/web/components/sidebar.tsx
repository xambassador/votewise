import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Bell } from "@votewise/ui/icons/bell";
import { Cog } from "@votewise/ui/icons/cog";
import { Home } from "@votewise/ui/icons/home";
import { Search } from "@votewise/ui/icons/search";
import { User } from "@votewise/ui/icons/user";
import { Users } from "@votewise/ui/icons/users";

import { CreatePostDialog } from "./create-post";
import { Link } from "./link";
import { Logout } from "./logout";
import { NotificationButton } from "./notification-button";

type Props = {
  name: string;
  avatarUrl: string;
};

const links: {
  id: string;
  href: string;
  icon: React.ReactNode;
  name: string;
  component?: React.ComponentType;
}[] = [
  { id: "home", href: "/", icon: <Home className="text-inherit" />, name: "Home" },
  { id: "groups", href: "/groups", icon: <Users className="text-inherit" />, name: "Groups" },
  { id: "search", href: "/search", icon: <Search className="text-inherit" />, name: "Search" },
  {
    id: "notifications",
    href: "/notifications",
    icon: <Bell className="text-inherit" />,
    name: "Notifications",
    component: NotificationButton
  },
  { id: "profile", href: "/profile", icon: <User className="text-inherit" />, name: "Profile" },
  { id: "settings", href: "/settings", icon: <Cog className="text-inherit" />, name: "Settings" }
];

export function Sidebar(props: Props) {
  const { name, avatarUrl } = props;
  return (
    <aside className="flex-1 sidebar-max-width border-r border-nobelBlack-200 pt-7 max-h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        <div className="pl-2 pr-1">
          <Avatar>
            <AvatarFallback name={name} />
            <AvatarImage src={avatarUrl} alt={name} />
          </Avatar>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 pr-1">
            {links.map((link) => {
              if (link.component) {
                return <link.component key={link.id} />;
              }
              return (
                <Link key={link.id} href={link.href} className="focus-visible">
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
            <Logout />
          </div>
          <CreatePostDialog />
        </div>
      </div>
    </aside>
  );
}
