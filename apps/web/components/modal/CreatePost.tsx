import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React from "react";

import { Avatar, Button, Input, ModalTitle, TextArea } from "@votewise/ui";
import { FiGlobe } from "@votewise/ui/icons";

export function CreatePost() {
  return (
    <div className="shadow-notification-container flex w-[calc((510/16)*1rem)] flex-col items-start gap-7 rounded-lg bg-white p-8">
      <ModalTitle>Create Post</ModalTitle>
      <div className="flex w-full flex-col gap-8">
        <div className="flex gap-4">
          <Avatar
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
            rounded
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-semibold text-gray-600">Naomi Yosida</h4>
            <div className="flex items-center gap-2">
              <FiGlobe className="h-5 w-5 text-gray-500" />
              <p className="text-gray-600">Public</p>
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
        <form className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Input
              name="title"
              type="text"
              className="w-full rounded placeholder:text-base placeholder:text-gray-400"
              placeholder="Give the title to your idea."
            />
            <div className="relative">
              <TextArea
                name="description"
                placeholder="What's in your mind, Naomi?"
                className="h-[calc((136/16)*1rem)] resize-none rounded placeholder:text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          <Button type="submit">Create</Button>
        </form>
      </div>
    </div>
  );
}
