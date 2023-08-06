import type { OrderBy, PostStatus } from "types/post";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React, { useRef, useState } from "react";
import { QueryClient, dehydrate, useQueryClient } from "react-query";

import classNames from "@votewise/lib/classnames";
import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetMyPostsResponse } from "@votewise/types";
import { Avatar, AvatarStack, Badge, Button, Modal, Spinner, makeToast } from "@votewise/ui";
import {
  FiLogOut,
  FiMapPin,
  FiUserX,
  FiMessageCircle as Message,
  Planet,
  FiSend as Sent,
  FiThumbsUp as Upvote,
} from "@votewise/ui/icons";

import { FilterDropdown } from "components/Dropdowns/FilterDropdown";
import { PostOptionsDropdown } from "components/Dropdowns/PostOptionsDropdown";
import { UpdatePost } from "components/modal/UpdatePost";
import {
  ButtonGroup,
  Post,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostStatuPill,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";
import { Comment, CommentBody, CommentHeader, CommentSeparator, CommentText } from "components/post/comments";

import { timeAgo } from "lib/date";
import { useDeletePostMutation } from "lib/hooks/useDeltePostMutation";
import { useGetMyComments } from "lib/hooks/useGetMyComments";
import { useGetMyFriends } from "lib/hooks/useGetMyFriends";
import { useGetMyPosts } from "lib/hooks/useGetMyPosts";
import { useIsMounted } from "lib/hooks/useIsMounted";
import { usePostChangeStatusMutation } from "lib/hooks/usePostChangeStatusMutation";
import { parsePostStatus } from "lib/parsePostStatus";
import { getServerSession } from "server/lib/getServerSession";

import { getMyPosts } from "server/services/user";

type PostType = GetMyPostsResponse["data"]["posts"][0];

type PostCardProps = {
  post: PostType;
  postStatus: PostStatus;
  orderBy: OrderBy;
  onDelete: (post: PostType) => void;
};

function PostCard(props: PostCardProps) {
  const { post, postStatus, orderBy, onDelete } = props;
  const previosStatus = useRef(post.status.toLowerCase() as PostStatus);
  const previosOrderBy = useRef(orderBy);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(post.status.toLowerCase() as PostStatus);
  const parsedText = parseHashTags(post.content);
  const queryClient = useQueryClient();

  const deletePostMutation = useDeletePostMutation(queryClient, {
    onSuccess: () => {
      onDelete(post);
    },
    onError: (error: any) => {
      const msg = error?.response.data.error.message || "Something went wrong";
      makeToast(msg, "error");
    },
  });

  const updateStatusMutation = usePostChangeStatusMutation(
    previosStatus.current,
    previosOrderBy.current,
    queryClient,
    {
      onSuccess: (data) => {
        makeToast(`Post status updated to ${data.data.post.status}`, "success");
      },
      onError: (error) => {
        const msg = error?.response.data.error.message || "Something went wrong";
        makeToast(msg, "error");
      },
    }
  );

  const handleOnUpdate = () => {
    setOpen(true);
  };

  const handleOnDelete = () => {
    deletePostMutation.mutate({
      postId: post.id,
      status: postStatus,
      orderBy,
    });
  };

  const handleOnDropDownChange = (s: PostStatus) => {
    updateStatusMutation.mutate({
      postId: post.id,
      status: s,
      orderBy,
    });
    setSelected(s);
  };

  const handleOnArchive = () => {
    updateStatusMutation.mutate({
      postId: post.id,
      status: "archived",
      orderBy,
    });
  };

  return (
    <Post>
      <PostUserPill
        avatar={post.author.profile_image}
        location={post.author.location}
        timeAgo={timeAgo(post.updated_at)}
        userName={post.author.name}
      >
        <div className="flex h-fit items-center gap-4">
          <PostStatuPill type={parsePostStatus(post.status)}>{post.status}</PostStatuPill>
          {(deletePostMutation.isLoading || updateStatusMutation.isLoading) && (
            <Spinner className="h-5 w-5" />
          )}
          {!deletePostMutation.isLoading && (
            <PostOptionsDropdown
              selected={selected}
              onFilterChange={handleOnDropDownChange}
              onDelete={handleOnDelete}
              onUpdate={handleOnUpdate}
              onArchive={handleOnArchive}
            />
          )}
        </div>
      </PostUserPill>
      <PostTitle>
        <Link href={`/post/${post.id}`}>{post.title}</Link>
      </PostTitle>
      <PostGallary images={post.post_assets} />
      <PostText>{parsedText.text}</PostText>
      {parsedText.hashtags.length > 0 && (
        <PostHashTags>
          {parsedText.hashtags.map((hashtag) => (
            <Link key={hashtag} href={`/hashtag/${hashtag}`}>
              #{hashtag}{" "}
            </Link>
          ))}
        </PostHashTags>
      )}
      <PostFooter>
        <ButtonGroup>
          <button type="button" disabled={false} className="disabled:cursor-not-allowed" onClick={() => {}}>
            <Upvote
              className={classNames(
                "h-5 w-5 text-gray-500",
                post.upvotes.find((u) => u.user_id === post.author_id) && "text-blue-500"
              )}
            />
          </button>
          <span className="text-sm text-gray-600">{post.upvotes_count}</span>
        </ButtonGroup>
        <ButtonGroup>
          <span>
            <Message className="h-5 w-5 text-gray-500" />
          </span>
          <span className="text-sm text-gray-600">{post.comments_count} Comments</span>
        </ButtonGroup>
        <ButtonGroup>
          <span>
            <Sent className="h-5 w-5 text-gray-500" />
          </span>
          <span className="text-sm text-gray-600">Share</span>
        </ButtonGroup>
      </PostFooter>

      <Modal open={open} setOpen={setOpen}>
        <UpdatePost
          setOpen={setOpen}
          post={post}
          postStatus={previosStatus.current}
          orderBy={previosOrderBy.current}
        />
      </Modal>
    </Post>
  );
}

type Props = {
  postStatus: PostStatus;
  orderBy: OrderBy;
};

function Posts(props: Props & { refetchOnMount: boolean }) {
  const { postStatus, orderBy, refetchOnMount } = props;
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetMyPosts(
    postStatus,
    orderBy,
    {
      refetchOnMount,
    }
  );

  const handleOnPostDelete = (post: PostType) => {
    makeToast(`Your post "${post.title} has been removed."`, "success");
  };

  return (
    <div className="flex flex-col gap-8">
      {(status === "loading" || isFetching) && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="h-6 w-6" />
          <span className="text-lg font-semibold text-gray-600">Loading...</span>
        </div>
      )}

      {data?.pages[0].data.posts.length === 0 && status !== "loading" && !isFetching && (
        <div className="flex flex-col items-center">
          <Planet className="fill-gray-600" width={200} height={200} />
          <h2 className="text-xl font-semibold text-gray-600">
            Sorry!, we don&apos;t have anything to show you.
          </h2>
        </div>
      )}

      {status !== "loading" &&
        !isFetching &&
        data?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {page.data.posts.map((post) => (
              <PostCard
                post={post}
                key={post.id}
                postStatus={postStatus}
                orderBy={orderBy}
                onDelete={handleOnPostDelete}
              />
            ))}
          </React.Fragment>
        ))}

      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        isLoading={isFetchingNextPage || isFetching}
        dark
      >
        {hasNextPage && "Load More"}
        {!hasNextPage && "Nothing more to load"}
      </Button>
    </div>
  );
}

function Comments(props: Props) {
  const { orderBy, postStatus } = props;
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetMyComments(
    postStatus,
    orderBy
  );
  return (
    <div className="flex flex-col gap-8">
      {(status === "loading" || isFetching) && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="h-6 w-6" />
          <span className="text-lg font-semibold text-gray-600">Loading...</span>
        </div>
      )}

      {data?.pages[0].data.comments.length === 0 && status !== "loading" && !isFetching && (
        <div className="flex flex-col items-center">
          <Planet className="fill-gray-600" width={200} height={200} />
          <h2 className="text-xl font-semibold text-gray-600">
            Sorry!, we don&apos;t have anything to show you.
          </h2>
        </div>
      )}

      {status !== "loading" &&
        !isFetching &&
        data?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {page.data.comments.map((comment) => (
              <Post key={comment.id}>
                <PostUserPill
                  userName={comment.post.author.name}
                  avatar={comment.post.author.profile_image}
                  location={comment.post.author.location}
                  timeAgo={timeAgo(comment.post.updated_at)}
                >
                  <div className="flex h-fit items-center gap-4">
                    <PostStatuPill type={parsePostStatus(comment.post.status)}>
                      {comment.post.status}
                    </PostStatuPill>
                  </div>
                </PostUserPill>
                <PostTitle>
                  <Link href={`/post/${comment.post.id}`}>{comment.post.title}</Link>
                </PostTitle>

                <ul>
                  <Comment>
                    <CommentHeader>
                      <Avatar
                        src={comment.user.profile_image}
                        width={48}
                        height={48}
                        rounded
                        className="flex-[0_0_48px]"
                      />
                      <span className="text-base font-medium text-gray-800">{comment.user.name}</span>
                      <span className="text-sm text-gray-600">{timeAgo(comment.updated_at)}</span>
                    </CommentHeader>
                    <CommentBody>
                      <CommentSeparator />
                      <div className="ml-3 flex w-full flex-col gap-2">
                        <CommentText>{comment.text}</CommentText>
                        <div className="flex items-center gap-2">
                          <span>
                            <Upvote className="h-5 w-5 text-gray-500" />
                          </span>
                          <span className="text-sm text-gray-600">{comment.upvotes_count}</span>
                        </div>
                      </div>
                    </CommentBody>
                  </Comment>
                </ul>
              </Post>
            ))}
          </React.Fragment>
        ))}

      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        isLoading={isFetchingNextPage || isFetching}
        dark
      >
        {hasNextPage && "Load More"}
        {!hasNextPage && "Nothing more to load"}
      </Button>
    </div>
  );
}

function Archived(props: Props) {
  const { postStatus, orderBy } = props;
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetMyPosts(
    postStatus,
    orderBy,
    {
      refetchOnMount: true,
    }
  );

  const handleOnPostDelete = (post: PostType) => {
    makeToast(`Your post "${post.title} has been removed."`, "success");
  };

  return (
    <div className="flex flex-col gap-8">
      {(status === "loading" || isFetching) && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="h-6 w-6" />
          <span className="text-lg font-semibold text-gray-600">Loading...</span>
        </div>
      )}

      {data?.pages[0].data.posts.length === 0 && status !== "loading" && !isFetching && (
        <div className="flex flex-col items-center">
          <Planet className="fill-gray-600" width={200} height={200} />
          <h2 className="text-xl font-semibold text-gray-600">
            Sorry!, we don&apos;t have anything to show you.
          </h2>
        </div>
      )}

      {status !== "loading" &&
        !isFetching &&
        data?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {page.data.posts.map((post) => (
              <PostCard
                post={post}
                key={post.id}
                postStatus={postStatus}
                orderBy={orderBy}
                onDelete={handleOnPostDelete}
              />
            ))}
          </React.Fragment>
        ))}

      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        isLoading={isFetchingNextPage || isFetching}
        dark
      >
        {hasNextPage && "Load More"}
        {!hasNextPage && "Nothing more to load"}
      </Button>
    </div>
  );
}

// TODO: Make this component dynamic
function FriendCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 py-4 px-3">
      <div className="flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?"
          alt="User Avatar"
          className="h-[calc((68/16)*1rem)]  w-[calc((68/16)*1rem)]"
          width={68}
          height={68}
        />
        <div className="flex flex-col items-center gap-1">
          <h4 className="font-medium text-gray-600">Selma Knight</h4>
          <span className="text-xs text-gray-500">@selma_knight</span>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        The chair sat in the corner where it had been for over 25 years.
      </p>

      <div className="flex items-center gap-1">
        <FiMapPin className="h-5 w-5 text-gray-500" />
        <span className="text-gray-600">Japan</span>
      </div>

      <Button className="gap-2 bg-red-100">
        <FiUserX className="h-5 w-5 text-red-800" />
        <span className="text-sm text-red-800">Remove</span>
      </Button>
    </div>
  );
}

function Friends() {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetMyFriends();

  return (
    <div className="flex flex-col gap-8">
      {(status === "loading" || isFetching) && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner className="h-6 w-6" />
          <span className="text-lg font-semibold text-gray-600">Loading...</span>
        </div>
      )}

      {data?.pages[0].data.friends.length === 0 && status !== "loading" && !isFetching && (
        <div className="flex flex-col items-center">
          <Planet className="fill-gray-600" width={200} height={200} />
          <h2 className="text-xl font-semibold text-gray-600">
            Sorry!, we don&apos;t have anything to show you.
          </h2>
        </div>
      )}

      {status !== "loading" &&
        !isFetching &&
        data?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            <div className="grid max-w-[calc((774/16)*1rem)] grid-cols-2 gap-7">
              {page.data.friends.map((friend) => (
                <FriendCard key={friend.friend_id} />
              ))}
            </div>
          </React.Fragment>
        ))}

      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        isLoading={isFetchingNextPage || isFetching}
        dark
      >
        {hasNextPage && "Load More"}
        {!hasNextPage && "Nothing more to load"}
      </Button>
    </div>
  );
}

function GroupCard() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-200 py-7 px-9">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-600">Naomi&apos;s Room</span>
        <span className="flex items-center gap-[2px] rounded-full bg-green-200 py-[2px] px-[10px]">
          <svg width="6" height="7" viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="3.5" r="3" fill="#2B8A3E" />
          </svg>
          <span className="text-sm text-green-900">Active</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
          alt="User Avatar"
          rounded
        />

        <div className="flex flex-col">
          <span className="font-medium text-gray-600">Naomi Yoshida</span>
          <span className="text-xs text-gray-600">naomiy@gmail.com</span>
        </div>
      </div>

      <div className="flex items-center gap-9">
        <div className="flex flex-col text-center">
          <span className="text-sm text-gray-600">Type</span>
          <span className="font-medium text-gray-800">Public</span>
        </div>
        <div className="flex flex-col text-center">
          <span className="text-sm text-gray-600">Created</span>
          <span className="font-medium text-gray-800">3 Months ago</span>
        </div>
      </div>

      <AvatarStack
        className="-space-x-2"
        avatars={[
          {
            src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1608889175123-8ee362201f81",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
          {
            src: "https://images.unsplash.com/photo-1640951613773-54706e06851d",
            alt: "User Avatar",
            width: 28,
            height: 28,
          },
        ]}
      />

      <Button className="gap-1">
        <span>
          <FiLogOut className="h-5 w-5 text-blue-50" />
        </span>
        <span className="text-blue-50">Leave</span>
      </Button>
    </div>
  );
}

function Groups() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-7">
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
      </div>
    </div>
  );
}

type TabsValues = "POST" | "COMMENTS" | "ARCHIVED" | "FRIENDS" | "GROUPS";
type Tab = { label: string; value: TabsValues };

const tabs: Tab[] = [
  { label: "Posts", value: "POST" },
  { label: "Comments", value: "COMMENTS" },
  { label: "Archived", value: "ARCHIVED" },
  { label: "Friends", value: "FRIENDS" },
  { label: "Groups", value: "GROUPS" },
];

export default function Page() {
  const [postStatus, setPostStatus] = useState<PostStatus>("open");
  const [orderBy, setOrderBy] = useState<OrderBy>("desc");
  const [selectedTab, setSelectedTab] = useState<TabsValues>(tabs[0].value as TabsValues);
  const isMounted = useIsMounted();

  const handleOnFilterChange = (s: PostStatus | "orderBy") => {
    if (s === "orderBy") {
      setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setPostStatus(s);
  };

  const handleOnTabChange = (tab: Tab) => {
    setSelectedTab(tab.value);
  };

  return (
    <div className="min-w-[calc((774/16)*1rem)]">
      {/* Profile tabs */}
      <div className="mb-10 flex items-center">
        <ul className="flex items-center gap-4">
          {tabs.map((tab) => (
            <li key={tab.label}>
              <button type="button" onClick={() => handleOnTabChange(tab)}>
                <Badge type={selectedTab === tab.value ? "primary" : "secondary"}>{tab.label}</Badge>
              </button>
            </li>
          ))}
        </ul>
        <div className="ml-auto">
          <FilterDropdown selected={postStatus} onFilterChange={handleOnFilterChange} orderBy={orderBy} />
        </div>
      </div>

      {selectedTab === "POST" && (
        <Posts orderBy={orderBy} postStatus={postStatus} refetchOnMount={isMounted.current} />
      )}
      {selectedTab === "COMMENTS" && <Comments orderBy={orderBy} postStatus={postStatus} />}
      {selectedTab === "ARCHIVED" && <Archived orderBy={orderBy} postStatus="archived" />}
      {selectedTab === "FRIENDS" && <Friends />}
      {selectedTab === "GROUPS" && <Groups />}
    </div>
  );
}

// TODO: Replace with auth guard
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const session = await getServerSession({ req, res });
  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery(["my-posts", "open", "desc"], async () => {
    // TODO: Move hardcoded limit and offset to constants
    const { data } = await getMyPosts(session.accessToken, 5, 0);
    return data;
  });
  const dehydratedClient = dehydrate(queryClient);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  dehydratedClient.queries[0].state.data.pageParams = [null];

  return {
    props: {
      dehydratedState: dehydratedClient,
    },
  };
};
