import { useStore } from "zustand";

import React from "react";

import { Avatar, Button, EmailField, Image, Input, InputField, TextAreaField } from "@votewise/ui";
import { FiFacebook, FiInstagram, FiTwitter } from "@votewise/ui/icons";

import store from "lib/store";

export function Profile() {
  const user = useStore(store, (state) => state.user);
  return (
    <div className="flex w-[calc((768/16)*1rem)] max-w-3xl flex-col gap-7 rounded-lg bg-white p-7">
      <div className="relative mb-7 w-full">
        <figure className="h-60 w-full overflow-hidden rounded-lg">
          <Image src={user?.cover_image as string} alt="Profile banner" width={768} height={240} />
        </figure>
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">
          <Avatar src={user?.profile_image as string} width={80} height={80} withStroke />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <EmailField
          name="email"
          label="Email"
          placeholder={user?.email}
          value={user?.email}
          className="text-gray-600"
          labelProps={{
            className: "text-left font-medium",
          }}
        />
        <InputField
          name="name"
          type="text"
          placeholder={user?.name}
          value={user?.name}
          label="Name"
          className="text-gray-600"
          labelProps={{
            className: "text-left font-medium",
          }}
        />
        <TextAreaField
          label="About"
          name="about"
          labelProps={{
            className: "text-left font-medium",
          }}
          className="resize-none text-gray-600"
          placeholder={user?.about}
          value={user?.about}
        />
        <InputField
          name="name"
          type="text"
          placeholder={user?.location}
          value={user?.location}
          label="Location"
          className="text-gray-600"
          labelProps={{
            className: "text-left font-medium",
          }}
        />
        <div className="flex gap-6">
          <button
            type="button"
            className="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-gray-800 transition-colors duration-200 hover:bg-gray-600"
          >
            <FiFacebook className="h-5 w-5 text-white" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 flex-col items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <FiInstagram className="h-5 w-5 text-gray-500" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 flex-col items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200"
          >
            <FiTwitter className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mt-2">
          <Input type="text" name="social-url" placeholder="https://www.facebook.com/user/yash" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-7">
        <Button secondary className="w-fit py-4 px-5">
          Cancle
        </Button>
        <Button className="w-fit py-4 px-5">Save</Button>
      </div>
    </div>
  );
}
