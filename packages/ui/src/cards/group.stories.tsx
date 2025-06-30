import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage, images } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { FloatingCounter } from "../floating-counter";
import {
  Group,
  GroupActionButton,
  GroupAuthor,
  GroupAuthorHandle,
  GroupAuthorName,
  GroupCreatedAt,
  GroupHeader,
  GroupMembers,
  GroupName,
  GroupStatusBadge,
  GroupType
} from "./group";

const meta = {
  title: "ui/Group",
  component: Group,
  tags: ["autodocs", "group"],
  render: (args) => (
    <Group {...args}>
      <GroupHeader>
        <GroupName>Cincinnati club</GroupName>
        <GroupStatusBadge variant="success">open</GroupStatusBadge>
      </GroupHeader>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Avatar>
            <AvatarFallback name="Amelia olla" />
            <AvatarImage src={getRandomImage().url} />
          </Avatar>
          <div className="flex flex-col">
            <GroupAuthorName>Amelia Olla</GroupAuthorName>
            <GroupAuthorHandle>@ameliaolla</GroupAuthorHandle>
          </div>
        </GroupAuthor>
        <GroupType>Public</GroupType>
      </div>
      <div className="flex items-center justify-between">
        <GroupMembers>
          {images.slice(0, 5).map((image) => (
            <Avatar key={image.id} className="size-6">
              <AvatarFallback name={image.name} />
              <AvatarImage src={image.url} />
            </Avatar>
          ))}
          <FloatingCounter className="size-7 text-xs -right-4">+{images.length}</FloatingCounter>
        </GroupMembers>
        <GroupCreatedAt>Created 2 days ago</GroupCreatedAt>
      </div>
      <GroupActionButton>Join</GroupActionButton>
    </Group>
  )
} satisfies Meta<typeof Group>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = {
  render: (args) => (
    <Group {...args}>
      <GroupHeader>
        <GroupName>Cincinnati club</GroupName>
        <GroupStatusBadge variant="success">open</GroupStatusBadge>
      </GroupHeader>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Avatar>
            <AvatarFallback name="Amelia olla" />
            <AvatarImage src={getRandomImage().url} />
          </Avatar>
          <div className="flex flex-col">
            <GroupAuthorName>Amelia Olla</GroupAuthorName>
            <GroupAuthorHandle>@ameliaolla</GroupAuthorHandle>
          </div>
        </GroupAuthor>
        <GroupType>Public</GroupType>
      </div>
      <div className="flex items-center justify-between">
        <GroupMembers>
          {images.slice(0, 5).map((image) => (
            <Avatar key={image.id} className="size-6">
              <AvatarFallback name={image.name} />
              <AvatarImage src={image.url} />
            </Avatar>
          ))}
          <FloatingCounter className="size-7 text-xs -right-4">+{images.length}</FloatingCounter>
        </GroupMembers>
        <GroupCreatedAt>Created 2 days ago</GroupCreatedAt>
      </div>
      <GroupActionButton isClosed />
    </Group>
  )
};
