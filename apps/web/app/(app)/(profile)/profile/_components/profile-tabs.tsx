"use client";

import Link from "next/link";
import { useFetchUserComments } from "@/hooks/use-fetch-user-comments";
import { useFetchUserGroups } from "@/hooks/use-fetch-user-groups";
import { useFetchUserPosts } from "@/hooks/use-fetch-user-posts";
import { useFetchUserFollowers, useFetchUserFollowings } from "@/hooks/use-fetch-user-socials";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Error } from "@votewise/ui/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@votewise/ui/tab";

import { FeedMolecule } from "@/components/feed";
import { FeedListSkeleton } from "@/components/feed-skeleton";
import { GroupMolecule } from "@/components/group";
import { GroupListSkeleton } from "@/components/group-skeleton";

import { humanizeNumber } from "@/lib/humanize";
import { routes } from "@/lib/routes";
import { getFullName } from "@/lib/string";

extend(relativeTime);

const tabs = [
  { label: "Posts", value: "posts" },
  { label: "Comments", value: "comments" },
  { label: "Voted", value: "voted" },
  { label: "Followers", value: "followers" },
  { label: "Following", value: "following" },
  { label: "Groups", value: "groups" }
];

type TabPanelProps = { username: string; isItMe?: boolean };

export function ProfileTabs(props: TabPanelProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger value={tab.value} key={tab.value} className="pb-4 h-fit">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts">
        <PostsPanel {...props} />
      </TabsContent>

      <TabsContent value="comments">
        <CommentsPanel {...props} />
      </TabsContent>

      <TabsContent value="voted">
        <VotedPostsPanel {...props} />
      </TabsContent>

      <TabsContent value="followers">
        <FollowersPanel {...props} />
      </TabsContent>

      <TabsContent value="following">
        <FollowingsPanel {...props} />
      </TabsContent>

      <TabsContent value="groups">
        <GroupsPanel {...props} />
      </TabsContent>
    </Tabs>
  );
}

const panelStyle = "flex flex-col gap-5 pb-5";

function PostsPanel(props: TabPanelProps) {
  const { status, data, error } = useFetchUserPosts({ username: props.username });

  switch (status) {
    case "pending":
      return <FeedListSkeleton />;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.posts.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">
          {props.isItMe ? "You have" : "This user has"} not created any posts yet.
        </p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.posts.map((post) => (
        <Link key={post.id} href={routes.feed.view(post.id)} className="focus-presets rounded-xl">
          <FeedMolecule
            data={{
              ...post,
              author: { ...post.author, avatar_url: post.author.avatar_url ?? "" },
              hash_tags: [],
              voters: post.voters.map((v) => ({ ...v, avatar_url: v.avatar_url ?? "" }))
            }}
          />
        </Link>
      ))}
    </div>
  );
}

function VotedPostsPanel(props: TabPanelProps) {
  const { status, data, error } = useFetchUserPosts({ username: props.username, type: "voted" });

  switch (status) {
    case "pending":
      return <FeedListSkeleton />;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.posts.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">This user has not voted on any posts yet.</p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.posts.map((post) => (
        <Link key={post.id} href={routes.feed.view(post.id)} className="focus-presets rounded-xl">
          <FeedMolecule
            data={{
              ...post,
              author: { ...post.author, avatar_url: post.author.avatar_url ?? "" },
              hash_tags: [],
              voters: post.voters.map((v) => ({ ...v, avatar_url: v.avatar_url ?? "" }))
            }}
          />
        </Link>
      ))}
    </div>
  );
}

function CommentsPanel(props: TabPanelProps) {
  const { status, data, error } = useFetchUserComments({ username: props.username });

  switch (status) {
    case "pending":
      return <div>Loading comments...</div>;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.comments.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">
          {props.isItMe ? "You have" : "This user has"} not made any comments yet.
        </p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200 hover:border-nobelBlack-300 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Link
              href={routes.user.profile(comment.user.user_name)}
              className="focus-visible rounded-full shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="size-12">
                <AvatarFallback name={getFullName(comment.user)} />
                <AvatarImage src={comment.user.avatar_url || ""} alt={getFullName(comment.user)} />
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  href={routes.user.profile(comment.user.user_name)}
                  className="text-base font-medium text-gray-200 hover:underline focus-visible rounded"
                >
                  {getFullName(comment.user)}
                </Link>
                <span className="text-sm text-gray-400">{dayjs(comment.created_at).fromNow()}</span>
              </div>
              <p className="text-base text-gray-300 leading-relaxed mb-2">{comment.text}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Commented on</span>
                <Link
                  href={routes.feed.view(comment.post.id)}
                  className="text-blue-300 hover:underline focus-visible rounded truncate max-w-[300px]"
                >
                  {comment.post.title}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FollowersPanel(props: TabPanelProps) {
  const { data, status, error } = useFetchUserFollowers({ username: props.username });
  switch (status) {
    case "pending":
      return <div>Loading followers...</div>;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.followers.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">{props.isItMe ? "You have" : "This user has"} no followers yet.</p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.followers.map((user) => (
        <UserCard key={user.user_name} user={user} />
      ))}
    </div>
  );
}

function FollowingsPanel(props: TabPanelProps) {
  const { data, status, error } = useFetchUserFollowings({ username: props.username });
  switch (status) {
    case "pending":
      return <div>Loading followers...</div>;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.following.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">
          {props.isItMe ? "You are" : "This user is"} not following anyone yet.
        </p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.following.map((user) => (
        <UserCard key={user.user_name} user={user} />
      ))}
    </div>
  );
}

type UserCardProps = {
  user: {
    user_name: string;
    avatar_url: string | null;
    about: string | null;
    first_name: string;
    last_name: string;
    aggregates: {
      total_followers: number;
      total_posts: number;
    };
  };
};

function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={routes.user.profile(user.user_name)}
      className="focus-visible rounded-xl block"
      aria-label={"View " + getFullName(user) + "'s profile"}
    >
      <div className="p-5 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200 hover:border-nobelBlack-300 transition-colors">
        <div className="flex items-start gap-4">
          <Avatar className="size-12">
            <AvatarImage src={user.avatar_url || ""} alt={getFullName(user)} />
            <AvatarFallback name={getFullName(user)} />
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-2 mb-1 flex-wrap">
              <span className="text-base font-semibold text-gray-300">{getFullName(user)}</span>
              <span className="text-gray-400 text-base">@{user.user_name}</span>
            </div>
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{user.about}</p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_followers)}</span>
                <span className="text-gray-400"> followers</span>
              </div>
              <div>
                <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_posts)}</span>
                <span className="text-gray-400"> posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function GroupsPanel(props: TabPanelProps) {
  const { data, status, error } = useFetchUserGroups({ username: props.username });

  switch (status) {
    case "pending":
      return <GroupListSkeleton className="gap-5" />;
    case "error":
      return <Error error={error.message} />;
  }

  if (data.groups.length === 0) {
    return (
      <div className="py-10">
        <p className="text-center text-gray-400">
          {props.isItMe ? "You have" : "This user has"} not joined any groups yet.
        </p>
      </div>
    );
  }

  return (
    <div className={panelStyle}>
      {data.groups.map((group) => (
        <GroupMolecule key={group.id} group={group} />
      ))}
    </div>
  );
}
