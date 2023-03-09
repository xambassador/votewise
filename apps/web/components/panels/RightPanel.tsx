import React from "react";
import type { ReactNode } from "react";

import { Avatar, Button, Edit, Image, UserPlus } from "@votewise/ui";

import { UserPill } from "../UserPill";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-[calc((324/16)*1rem)] max-w-[calc((324/16)*1rem)] rounded-lg border border-gray-200 bg-white">
      <div className="w-full px-8 py-6">{children}</div>
    </div>
  );
}

// TODO: Move to a separate file
function UserAvatarWithBanner() {
  return (
    <div className="relative w-full">
      <figure className="w-full">
        <Image
          src="https://images.unsplash.com/photo-1677608088332-433015612b03"
          alt="Banner"
          resetWidthAndHeight
          className="h-[calc((120/16)*1rem)] w-full rounded-lg object-cover"
          wrapperClassName="w-full h-[calc((120/16)*1rem)]"
        />
      </figure>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <Avatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80" alt="Profile" withStroke />
      </div>
    </div>
  );
}

// TODO: Move to a separate file
export function UserInfo() {
  return (
    <Wrapper>
      <div className="flex w-full flex-col">
        <UserAvatarWithBanner />
        <div className="mt-8 text-center">
          <h1 className="font-semibold text-gray-600">Selma knight</h1>
          <span className="block text-xs text-gray-500">@selma_knight</span>
        </div>

        <ul className="mx-auto mt-2 flex w-[calc((190/16)*1rem)] items-center justify-between">
          <li className="text-center">
            <span className="block font-bold text-gray-600">140</span>
            <span className="block text-xs text-gray-600">Posts</span>
          </li>

          <li className="text-center">
            <span className="block font-bold text-gray-600">120</span>
            <span className="block text-xs text-gray-600">Followers</span>
          </li>

          <li className="text-center">
            <span className="block font-bold text-gray-600">200</span>
            <span className="block text-xs text-gray-600">Following</span>
          </li>
        </ul>

        <Button className="mt-2 gap-2 py-3">
          <Edit />
          <span>Create Post</span>
        </Button>
      </div>
    </Wrapper>
  );
}

// TODO: Move to a separate file
export function UserRecommendations() {
  return (
    <Wrapper>
      <div>
        <h1 className="font-bold uppercase text-gray-600">Recommendations</h1>
        <ul className="mt-4">
          <li className="flex items-center justify-between">
            <UserPill
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              username="Nensi"
              usernameProps={{
                className: "font-medium",
              }}
            />
            <button type="button">
              <UserPlus />
            </button>
          </li>
        </ul>
      </div>
    </Wrapper>
  );
}

export function RightPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-7">{children}</div>;
}
