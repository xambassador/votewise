import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage, images } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Button } from "../button";
import { FloatingCounter } from "../floating-counter";
import {
  Group,
  GroupAuthor,
  GroupAuthorHandle,
  GroupAuthorName,
  GroupCreatedAt,
  GroupDescription,
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
    <Group className="min-w-[600px] max-w-[600px]" {...args}>
      <GroupHeader>
        <GroupName>Cincinnati club</GroupName>
        <GroupStatusBadge>open</GroupStatusBadge>
      </GroupHeader>
      <GroupDescription>
        A group for Cincinnati enthusiasts to discuss local events, share experiences, and connect with fellow members.
        This group is open to anyone interested in Cincinnati and its vibrant community. We welcome discussions on local
        culture, events, and more.
      </GroupDescription>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Avatar>
            <AvatarFallback name="Amelia olla" />
            <AvatarImage src={getRandomImage().url} className="overflow-clip-margin-unset" />
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
              <AvatarImage src={image.url} className="overflow-clip-margin-unset" />
            </Avatar>
          ))}
          <FloatingCounter className="size-7 text-xs -right-4">+{images.length}</FloatingCounter>
        </GroupMembers>
        <GroupCreatedAt>Created 2 days ago</GroupCreatedAt>
      </div>
    </Group>
  )
} satisfies Meta<typeof Group>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MyGroupCard: Story = {
  render: (args) => (
    <Group className="min-w-[600px] max-w-[600px]" {...args}>
      <GroupHeader>
        <GroupName>Cincinnati club</GroupName>
        <GroupStatusBadge>open</GroupStatusBadge>
      </GroupHeader>
      <GroupDescription>
        A group for Cincinnati enthusiasts to discuss local events, share experiences, and connect with fellow members.
        This group is open to anyone interested in Cincinnati and its vibrant community. We welcome discussions on local
        culture, events, and more.
      </GroupDescription>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Avatar>
            <AvatarFallback name="Amelia olla" />
            <AvatarImage src={getRandomImage().url} className="overflow-clip-margin-unset" />
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
              <AvatarImage src={image.url} className="overflow-clip-margin-unset" />
            </Avatar>
          ))}
          <FloatingCounter className="size-7 text-xs -right-4">+{images.length}</FloatingCounter>
        </GroupMembers>
        <GroupCreatedAt>Created 2 days ago</GroupCreatedAt>
      </div>

      <Button>Enter</Button>
    </Group>
  )
};
