"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Bell } from "@votewise/ui/icons/bell";
import { Cog } from "@votewise/ui/icons/cog";
import { Home } from "@votewise/ui/icons/home";
import { Search } from "@votewise/ui/icons/search";
import { User } from "@votewise/ui/icons/user";
import { Users } from "@votewise/ui/icons/users";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@votewise/ui/sheet";

import { CreatePostDialog } from "./dialogs/create-post";
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
    <aside className="hidden md:block xl:flex-1 sidebar-max-width border-r border-nobelBlack-200 pt-7 max-h-screen sticky top-0">
      <div className="flex flex-col gap-6 px-4 xl:px-0">
        <div className="xl:pl-2 xl:pr-1">
          <Avatar>
            <AvatarFallback name={name} />
            <AvatarImage src={avatarUrl} alt={name} />
          </Avatar>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col pr-1">
            {links.map((link) => {
              if (link.component) {
                return <link.component key={link.id} />;
              }
              return (
                <Link key={link.id} href={link.href} className="focus-visible">
                  {link.icon}
                  <span className="hidden xl:inline-block">{link.name}</span>
                </Link>
              );
            })}
            <Logout>
              <span className="hidden xl:inline-block">Logout</span>
            </Logout>
          </div>
          <CreatePostDialog />
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar(props: Props) {
  const { name, avatarUrl } = props;
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  if (isDesktop) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button>
          <Avatar>
            <AvatarFallback name={props.name} />
            <AvatarImage src={props.avatarUrl} alt={props.name} />
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full">
        <SheetHeader>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Mobile menu</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 xl:px-0">
          <div className="xl:pl-2 xl:pr-1">
            <Avatar>
              <AvatarFallback name={name} />
              <AvatarImage src={avatarUrl} alt={name} />
            </Avatar>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col pr-1">
              {links.map((link) => {
                if (link.component) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  return <link.component key={link.id} onClick={() => setOpen(false)} />;
                }
                return (
                  <Link key={link.id} href={link.href} className="focus-visible" onClick={() => setOpen(false)}>
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <Logout />
            </div>
            <CreatePostDialog />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
