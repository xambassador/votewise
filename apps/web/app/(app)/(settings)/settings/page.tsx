import { Fragment } from "react";
import Link from "next/link";

import { Bell } from "@votewise/ui/icons/bell";
import { ChevronRight } from "@votewise/ui/icons/chevron-right";
import { Setting } from "@votewise/ui/icons/setting";
import { User } from "@votewise/ui/icons/user";

import { Logout } from "@/components/logout";

import { routes } from "@/lib/routes";

const tabs = [
  { id: "account", label: "Account", icon: <User />, href: routes.settings.account() },
  { id: "notifications", label: "Notifications", icon: <Bell />, href: routes.settings.notifications() }
];

export default function Page() {
  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Setting />
          <h1 className="text-xl text-gray-300">Settings</h1>
        </div>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col p-4 rounded-xl bg-nobelBlack-200">
        {tabs.map((tab) => (
          <Link
            href={tab.href}
            key={tab.id}
            className="py-4 rounded-xl flex items-center justify-between hover:bg-nobelBlack-100 px-3"
          >
            <div className="flex items-center gap-2 text-gray-300">
              {tab.icon}
              {tab.label}
            </div>
            <ChevronRight />
          </Link>
        ))}
        <Logout className="text-red-500 hover:bg-nobelBlack-100 py-4 rounded-xl pl-3" />
      </div>
    </Fragment>
  );
}
