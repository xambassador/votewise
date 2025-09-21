"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@votewise/ui/tab";

import { CreateGroup } from "@/components/create-group";

const links = [
  { href: "/groups", label: "Groups", id: "groups" },
  { href: "/groups/my", label: "My Groups", id: "my-groups" },
  { href: "/groups/notifications", label: "Notifications", id: "notifications" }
];

export function GroupTabs() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Tabs className="tab-container" value={pathname} defaultValue={pathname}>
      <TabsList>
        {links.map((link) => (
          <TabsTrigger value={link.href} key={link.id} onClick={() => router.push(link.href)}>
            {link.label}
          </TabsTrigger>
        ))}
        <CreateGroup />
      </TabsList>
    </Tabs>
  );
}
