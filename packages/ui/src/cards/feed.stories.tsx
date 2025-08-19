import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Comment } from "../icons/comment";
import { PaperPlane } from "../icons/paper-plane";
import { Separator } from "../separator";
import {
  Feed,
  FeedContainer,
  FeedContent,
  FeedContentTags,
  FeedContentText,
  FeedFooter,
  FeedFooterActions,
  FeedFooterItem,
  FeedHeader,
  FeedTimeAgo,
  FeedUserName,
  VoteContainer,
  VoteCount,
  VoteLabel,
  Voters,
  VotersCount,
  VotersStack
} from "./feed";

const voters = [
  { name: "John doe", url: getRandomImage().url, isOnline: true },
  {
    name: "Tina methew",
    url: getRandomImage().url,
    isOnline: true
  },
  {
    name: "Alexander",
    url: getRandomImage().url,
    isOnline: false
  },
  {
    name: "George Smith",
    url: getRandomImage().url,
    isOnline: false
  },
  {
    name: "Charlie Brown",
    url: getRandomImage().url,
    isOnline: true
  }
];

const meta = {
  title: "ui/Feed",
  component: Feed,
  tags: ["autodocs", "feed"],
  render: (args) => (
    <Feed className="min-w-[600px]" {...args}>
      <VoteContainer>
        <VoteCount>50</VoteCount>
        <VoteLabel>Votes</VoteLabel>
      </VoteContainer>
      <Separator orientation="vertical" className="h-auto" />
      <FeedContainer>
        <div className="flex gap-2">
          <Avatar className="size-12">
            <AvatarFallback name="John doe" />
            <AvatarImage src={getRandomImage().url} alt="John doe" className="overflow-clip-margin-unset" />
          </Avatar>
          <FeedContent>
            <FeedHeader>
              <FeedUserName>John doe</FeedUserName>
              <FeedTimeAgo>2 days ago</FeedTimeAgo>
            </FeedHeader>
            <FeedContentText>The Underrated Joy of Cooking from Scratch</FeedContentText>
            <FeedContentTags>
              <span>#awesome</span>
              <span>#idea</span>
            </FeedContentTags>
          </FeedContent>
        </div>

        <FeedFooter>
          <FeedFooterActions>
            <FeedFooterItem>
              <Comment className="text-gray-400" />
              <span className="text-gray-400 text-xs">3 discussions</span>
            </FeedFooterItem>
            <FeedFooterItem>
              <PaperPlane className="text-gray-400" />
              <span className="text-gray-400 text-xs">Share</span>
            </FeedFooterItem>
          </FeedFooterActions>
          <VotersStack>
            <Voters>
              {voters.map((voter, index) => (
                <Avatar key={index} className="size-6" isOnline={voter.isOnline}>
                  <AvatarFallback name="John doe" />
                  <AvatarImage src={voter.url} className="overflow-clip-margin-unset" />
                </Avatar>
              ))}
            </Voters>
            <VotersCount>+30</VotersCount>
          </VotersStack>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  )
} satisfies Meta<typeof Feed>;

export default meta;

type Story = StoryObj<typeof Feed>;

export const Default: Story = {};

export const Voted: Story = {
  render: (args) => (
    <Feed className="min-w-[600px]" {...args}>
      <VoteContainer>
        <VoteCount isVoted>50</VoteCount>
        <VoteLabel isVoted>Votes</VoteLabel>
      </VoteContainer>
      <Separator orientation="vertical" className="h-auto" />
      <FeedContainer>
        <div className="flex gap-2">
          <Avatar className="size-12">
            <AvatarFallback name="John doe" />
            <AvatarImage src={getRandomImage().url} alt="John doe" className="overflow-clip-margin-unset" />
          </Avatar>
          <FeedContent>
            <FeedHeader>
              <FeedUserName>John doe</FeedUserName>
              <FeedTimeAgo>2 days ago</FeedTimeAgo>
            </FeedHeader>
            <FeedContentText>The Underrated Joy of Cooking from Scratch</FeedContentText>
            <FeedContentTags>
              <span>#awesome</span>
              <span>#idea</span>
            </FeedContentTags>
          </FeedContent>
        </div>

        <FeedFooter>
          <FeedFooterActions>
            <FeedFooterItem>
              <Comment className="text-gray-400" />
              <span className="text-gray-400 text-xs">3 discussions</span>
            </FeedFooterItem>
            <FeedFooterItem>
              <PaperPlane className="text-gray-400" />
              <span className="text-gray-400 text-xs">Share</span>
            </FeedFooterItem>
          </FeedFooterActions>

          <VotersStack>
            <Voters>
              {voters.map((voter, index) => (
                <Avatar key={index} className="size-6" isOnline={voter.isOnline}>
                  <AvatarFallback name="John doe" />
                  <AvatarImage src={voter.url} className="overflow-clip-margin-unset" />
                </Avatar>
              ))}
            </Voters>
            <VotersCount>+30</VotersCount>
          </VotersStack>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  )
};
