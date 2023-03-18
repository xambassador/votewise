import { useStore } from "zustand";

import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Avatar, Button, Image, Modal } from "@votewise/ui";
import { FiEdit as Edit } from "@votewise/ui/icons";

import { useMyDetails } from "lib/hooks/useMyDetails";
import store from "lib/store";

import { CreatePost } from "./modal/CreatePost";
import { UserInfoSkeleton } from "./skeletons/UserInfoSkeleton";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-[calc((324/16)*1rem)] max-w-[calc((324/16)*1rem)] rounded-lg border border-gray-200 bg-white">
      <div className="w-full px-8 py-6">{children}</div>
    </div>
  );
}

function UserAvatarWithBanner({
  avatar = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  banner = "https://images.unsplash.com/photo-1677608088332-433015612b03",
}) {
  return (
    <div className="relative z-[unset] w-full">
      <figure className="w-full">
        <Image
          src={banner}
          alt="Banner"
          resetWidthAndHeight
          className="h-[calc((120/16)*1rem)] w-full rounded-lg object-cover"
          wrapperClassName="w-full h-[calc((120/16)*1rem)]"
        />
      </figure>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <Avatar src={avatar} alt="Profile" withStroke />
      </div>
    </div>
  );
}

export function UserInfo() {
  const { data, error, status } = useMyDetails();

  const setUser = useStore(store, (state) => state.setUser);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setUser(data.data.user);
    }
  }, [data, setUser]);

  return (
    <>
      <Wrapper>
        {status === "loading" && <UserInfoSkeleton />}
        {status === "success" && (
          <div className="flex w-full flex-col">
            <UserAvatarWithBanner
              avatar={data?.data.user.profile_image}
              banner={data?.data.user.cover_image}
            />
            <div className="mt-8 text-center">
              <h1 className="font-semibold capitalize text-gray-600">{data?.data.user.name}</h1>
              <span className="block text-xs text-gray-500">@{data?.data.user.username}</span>
            </div>

            <ul className="mx-auto mt-2 flex w-[calc((190/16)*1rem)] items-center justify-between">
              <li className="text-center">
                <span className="block font-bold text-gray-600">{data?.data.user.posts}</span>
                <span className="block text-xs text-gray-600">Posts</span>
              </li>

              <li className="text-center">
                <span className="block font-bold text-gray-600">{data?.data.user.followers}</span>
                <span className="block text-xs text-gray-600">Followers</span>
              </li>

              <li className="text-center">
                <span className="block font-bold text-gray-600">{data?.data.user.following}</span>
                <span className="block text-xs text-gray-600">Following</span>
              </li>
            </ul>

            <Button className="mt-2 gap-2 py-3" onClick={() => setOpen(true)}>
              <Edit className="h-5 w-5" />
              <span>Create Post</span>
            </Button>
          </div>
        )}
        {status === "error" && (
          <div>
            <h2 className="text-center text-red-600">{error.response?.data.error.message}</h2>
          </div>
        )}
      </Wrapper>

      <Modal open={open} setOpen={setOpen}>
        <CreatePost setOpen={setOpen} />
      </Modal>
    </>
  );
}
