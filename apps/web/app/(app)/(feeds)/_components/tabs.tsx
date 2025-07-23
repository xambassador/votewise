"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@votewise/ui/tab";

const links = [
  { href: "/", label: "Discover", id: "discover" },
  { href: "/trending", label: "Trending", id: "trending" }
];

export function FeedTabs() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Tabs className="tab-container" defaultValue={pathname}>
      <div className="tab-list">
        <TabsList>
          {links.map((link) => (
            <TabsTrigger value={link.href} key={link.id} onClick={() => router.push(link.href)}>
              {link.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
