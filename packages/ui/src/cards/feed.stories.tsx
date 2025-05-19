import type { Meta, StoryObj } from "@storybook/react";

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
  { name: "John doe", url: "https://i.pinimg.com/736x/e3/24/f7/e324f790cfe0a51d76f98356475cc408.jpg", isOnline: true },
  {
    name: "Tina methew",
    url: "https://i.pinimg.com/736x/39/6d/f5/396df568a4325fe46c4a4801e198e7ef.jpg",
    isOnline: true
  },
  {
    name: "Alexander",
    url: "https://assets.tiltify.com/uploads/media_type/image/203025/blob-09636982-a21a-494b-bbe4-3692c2720ae3.jpeg",
    isOnline: false
  },
  {
    name: "George Smith",
    url: "https://i0.wp.com/katzenworld.co.uk/wp-content/uploads/2019/06/funny-cat.jpeg?fit=1020%2C1020&ssl=1",
    isOnline: false
  },
  {
    name: "Charlie Brown",
    url: "https://media.istockphoto.com/id/1128004359/photo/close-up-scottish-fold-cat-head-with-shocking-face-and-wide-open-eyes-frighten-or-surprised.jpg?s=612x612&w=0&k=20&c=HglQ8Nf1PslTuI91T-dfhkln-iEbchjqfhGKCWTbaxg=",
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
            <AvatarImage
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s"
              alt="John doe"
            />
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
                  <AvatarImage src={voter.url} />
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
            <AvatarImage
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s"
              alt="John doe"
            />
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
                  <AvatarImage src={voter.url} />
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
