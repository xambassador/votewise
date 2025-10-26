import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  Group,
  GroupContent,
  GroupCreatedAt,
  GroupCreatedBy,
  GroupDescription,
  GroupFooter,
  GroupHeader,
  GroupMembers,
  GroupName,
  GroupStatusBadge
} from "./group";

const meta = {
  title: "ui/Group",
  component: Group,
  tags: ["autodocs", "group"],
  render: (args) => (
    <Group className="min-w-[600px] max-w-[600px]" {...args}>
      <div className="flex items-start gap-4">
        <Avatar className="size-20 rounded-xl">
          <AvatarFallback name="Cincinnati club" />
          <AvatarImage src={getRandomImage().url} className="overflow-clip-margin-unset" />
        </Avatar>

        <GroupContent>
          <GroupHeader>
            <GroupName>Cincinnati club</GroupName>
            <GroupCreatedAt>Created 2 days ago</GroupCreatedAt>
          </GroupHeader>
          <GroupDescription>
            A group for Cincinnati enthusiasts to discuss local events, share experiences, and connect with fellow
            members. This group is open to anyone interested in Cincinnati and its vibrant community. We welcome
            discussions on local culture, events, and more.
          </GroupDescription>
          <GroupFooter>
            <GroupMembers total="1.2K" />
            <GroupStatusBadge>open</GroupStatusBadge>
          </GroupFooter>
          <GroupCreatedBy>Created by johndoe</GroupCreatedBy>
        </GroupContent>
      </div>
    </Group>
  )
} satisfies Meta<typeof Group>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
