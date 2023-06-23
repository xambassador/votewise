import React from "react";

import { Avatar, AvatarStack, Badge, Button } from "@votewise/ui";
import { FiFilter, FiUserPlus, FiUsers } from "@votewise/ui/icons";

function Group() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 px-9 py-7">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-600">Naomis&apos; Room</span>
        <Badge type="success">Active</Badge>
      </div>

      <div className="flex gap-4">
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
          alt="User Avatar"
          rounded
          width={40}
          height={40}
        />

        <div className="flex flex-col">
          <span className="font-medium text-gray-600">Naomi Yoshida</span>
          <span className="text-xs text-gray-600">naomiy@gmail.com</span>
        </div>
      </div>

      <div className="flex items-center gap-9">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Type</span>
          <span className="font-medium text-gray-800">Private</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Created</span>
          <span className="font-medium text-gray-800">5 Days ago</span>
        </div>
      </div>

      <AvatarStack
        className="-space-x-2"
        avatars={[
          {
            src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1608889175123-8ee362201f81",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1640951613773-54706e06851d",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
        ]}
      />

      <Button className="gap-2 bg-blue-400 py-2">
        <FiUserPlus className="h-5 w-5" />
        <span>Request to Join</span>
      </Button>
    </div>
  );
}

export default function Groups() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Badge type="primary">All</Badge>
          <Badge type="secondary">Invitations</Badge>
          <Badge type="secondary">My Groups</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button className="w-fit gap-2 bg-blue-700 px-5 py-[10px]">
            <FiUsers className="h-4 w-5" />
            <span className="font-normal text-blue-50">New Group</span>
          </Button>

          <Button className="w-fit gap-2 px-5 py-[10px]" dark>
            <FiFilter className="h-4 w-5" />
            <span className="font-normal text-blue-50">Filters</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-8">
        <Group />
        <Group />
        <Group />
        <Group />
      </div>
    </div>
  );
}
