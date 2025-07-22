"use client";

import { usePathname } from "next/navigation";

import { NavTabButton, NavTabs } from "@/components/nav-tabs";

const links = [
  { href: "/groups", label: "Groups", id: "groups" },
  { href: "/groups/my", label: "My Groups", id: "my-groups" },
  { href: "/groups/invitations", label: "Invitations", id: "invitations" }
];

export function GroupTabs() {
  const pathname = usePathname();
  return (
    <NavTabs>
      {links.map((link) => (
        <NavTabButton key={link.id} isActive={pathname.startsWith(link.href)}>
          {link.label}
        </NavTabButton>
      ))}
    </NavTabs>
  );
}
