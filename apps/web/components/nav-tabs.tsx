"use client";

import { usePathname } from "next/navigation";

export function NavTabs() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname.includes("feeds");
  const isGroups = pathname.startsWith("/groups");

  if (isHome) {
    return <FeedTabs />;
  }

  if (isGroups) {
    return <GroupTabs />;
  }

  return null;
}

const tabsWrapperClass = "flex items-center gap-4 border-b border-nobelBlack-200 tab-wrapper-width mx-auto";
const activeButtonClass = "h-7 text-blue-200 text-sm font-medium border-b border-blue-600";
const inActiveButtonClass = "h-7 text-black-200 text-sm font-medium";

function FeedTabs() {
  return (
    <div className="tab-container">
      <div className={tabsWrapperClass}>
        <button className={activeButtonClass}>Discover</button>
        <button className={inActiveButtonClass}>Trending</button>
      </div>
    </div>
  );
}

function GroupTabs() {
  return (
    <div className="tab-container">
      <div className={tabsWrapperClass}>
        <button className={activeButtonClass}>Groups</button>
        <button className={inActiveButtonClass}>My Groups</button>
        <button className={inActiveButtonClass}>Invitations</button>
      </div>
    </div>
  );
}
