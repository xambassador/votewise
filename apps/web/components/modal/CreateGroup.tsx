import React from "react";

import { Avatar, Button, InputField, TextAreaField } from "@votewise/ui";

import { Indicator } from "../Indicator";

export function CreateGroup() {
  return (
    <div className="shadow-modal flex w-[540px] shrink-0 flex-col items-start justify-center gap-5 rounded-lg bg-white p-9">
      <h1 className="text-3xl font-bold text-gray-800">Create New Group</h1>

      <div className="flex shrink-0 flex-col items-start justify-start gap-3">
        <span className="font-medium text-gray-600">Admin / Creator</span>

        <div className="relative flex shrink-0 flex-row items-center justify-start gap-4 rounded-lg bg-[#ffffff] p-2">
          <Avatar
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956"
            alt="Naomi Yoshida"
            width={40}
            height={40}
            rounded
          />

          <div className="relative flex shrink-0 flex-col items-start justify-start gap-0">
            <span className="font-medium text-gray-600">Naomi Yoshida</span>
            <span className="text-xs text-gray-600">naomiy@gmail.com</span>
          </div>
        </div>
      </div>

      <InputField
        name="group-name"
        label="Group Name"
        labelProps={{ className: "text-left font-medium" }}
        className="p-[10px] placeholder:text-sm"
        type="text"
        placeholder="Enter Group Name"
      />

      <TextAreaField
        name="group-description"
        label="Group Description"
        labelProps={{ className: "text-left font-medium" }}
        className="h-16 resize-none p-2.5 font-medium placeholder:text-sm placeholder:font-normal"
        placeholder="Enter Group Description"
      />

      <div className="relative flex shrink-0 flex-col items-start justify-start gap-3">
        <span className="font-medium text-gray-600">Group Type</span>

        <div className="flex shrink-0 flex-row items-center justify-start gap-2">
          <Indicator isSelected selectionColor="#4DABF7" unselectedColor="#4B5563" />
          <span className="text-sm text-gray-600">Public</span>
        </div>
        <div className="flex shrink-0 flex-row items-center justify-start gap-2">
          <Indicator isSelected={false} selectionColor="#4DABF7" unselectedColor="#4B5563" />
          <span className="text-sm text-gray-600">Private Friend Only</span>
        </div>

        <div className="relative flex shrink-0 flex-row items-center justify-start gap-2">
          <div className="relative flex shrink-0 flex-row items-center justify-start gap-2.5 rounded-[14px] bg-gray-400 pt-0.5 pr-4 pb-0.5 pl-0.5">
            <div className="bg-gray-bg relative h-3 w-3 shrink-0 rounded-[50%]"></div>
          </div>

          <div
            className="relative text-left text-gray-600"
            style={{
              font: "var(--leading-14-normal, 400 14px/20px 'Inter', sans-serif)",
            }}
          >
            Send Reqeust
          </div>
        </div>
      </div>

      <div className="relative flex shrink-0 flex-row items-start justify-start gap-4 self-stretch">
        <Button className="bg-blue-400 p-2.5 text-gray-50">Create</Button>
        <Button className="p-2.5 text-gray-600" secondary>
          Cancel
        </Button>
      </div>
    </div>
  );
}
