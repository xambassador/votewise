import React, { useState } from "react";

import { Avatar, AvatarStack, Badge, Button, Modal } from "@votewise/ui";
import { FiFilter, FiInfo, FiLogIn, FiUserPlus, FiUserX, FiUsers } from "@votewise/ui/icons";

import { CreateGroup } from "components/modal/CreateGroup";

function Group({ isMemeber = false }: { isMemeber?: boolean }) {
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
        {isMemeber && <FiLogIn className="h-5 w-5" />}
        {!isMemeber && <FiUserPlus className="h-5 w-5" />}
        {isMemeber && <span>Enter</span>}
        {!isMemeber && <span>Request to Join</span>}
      </Button>
    </div>
  );
}

function Invitations({ isUnderPending = false }: { isUnderPending?: boolean }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-gray-200 py-7 px-9">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-600">Naomi&apos;s Room</span>
        <Badge type="success">Active</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?"
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
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600">Type</span>
            <span className="text-sm font-medium text-gray-800">Public</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600">Created</span>
            <span className="text-sm font-medium text-gray-800">3 Months ago</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600">Invited at</span>
            <span className="text-sm font-medium text-gray-800">5 Minutes ago</span>
          </div>
        </div>
      </div>

      {!isUnderPending && (
        <div className="flex items-center justify-between">
          <div>
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
          </div>
          <div className="flex items-center gap-7">
            <Button className="gap-1 bg-green-600 px-10 py-2">
              <FiUserPlus className="h-5 w-5" />
              <span className="text-green-50">Accept</span>
            </Button>
            <Button className="gap-1 bg-red-700 px-10 py-2">
              <FiUserX className="h-5 w-5" />
              <span className="text-green-50">Accept</span>
            </Button>
          </div>
        </div>
      )}

      {isUnderPending && (
        <div className="flex items-center justify-center gap-3 rounded bg-blue-100 py-3 px-4 text-blue-800">
          <FiInfo className="h-5 w-5" />
          <span>Your request is under pending.</span>
        </div>
      )}
    </div>
  );
}

export default function Groups() {
  const [tab, setTab] = useState<"all" | "invitations" | "my-groups">("all");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <button type="button" onClick={() => setTab("all")}>
              <Badge type={tab === "all" ? "primary" : "secondary"}>All</Badge>
            </button>
            <button type="button" onClick={() => setTab("invitations")}>
              <Badge type={tab === "invitations" ? "primary" : "secondary"}>Invitations</Badge>
            </button>
            <button type="button" onClick={() => setTab("my-groups")}>
              <Badge type={tab === "my-groups" ? "primary" : "secondary"}>My Groups</Badge>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button className="w-fit gap-2 bg-blue-700 px-5 py-[10px]" onClick={() => setOpen(true)}>
              <FiUsers className="h-4 w-5" />
              <span className="font-normal text-blue-50">New Group</span>
            </Button>

            <Button className="w-fit gap-2 px-5 py-[10px]" dark>
              <FiFilter className="h-4 w-5" />
              <span className="font-normal text-blue-50">Filters</span>
            </Button>
          </div>
        </div>

        {tab === "all" && (
          <div className="mt-6 grid grid-cols-4 gap-8">
            <Group />
            <Group />
            <Group />
            <Group />
          </div>
        )}

        {tab === "invitations" && (
          <div className="mt-6 grid grid-cols-2 gap-14">
            <Invitations />
            <Invitations isUnderPending />
            <Invitations />
            <Invitations isUnderPending />
          </div>
        )}

        {tab === "my-groups" && (
          <div className="mt-6 grid grid-cols-4 gap-8">
            <Group isMemeber />
            <Group isMemeber />
            <Group isMemeber />
            <Group isMemeber />
            <Group isMemeber />
          </div>
        )}
      </div>

      <Modal open={open} setOpen={setOpen}>
        <CreateGroup />
      </Modal>
    </>
  );
}
