"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@votewise/ui/tab";

const links = [
  { href: "/groups", label: "Groups", id: "groups" },
  { href: "/groups/my", label: "My Groups", id: "my-groups" },
  { href: "/groups/invitations", label: "Invitations", id: "invitations" }
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
      </TabsList>
    </Tabs>
  );
}
