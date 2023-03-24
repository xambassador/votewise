import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { QueryClient, dehydrate } from "react-query";

import { classNames } from "@votewise/lib";
import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetMyPostsResponse } from "@votewise/types";
import {
  Badge,
  Button,
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownMenuItemsGroup,
  DropdownTransition,
  Modal,
  Spinner,
} from "@votewise/ui";
import {
  FiArchive,
  FiClock,
  FiEdit2,
  FiFilter,
  FiTrash2,
  FiMessageCircle as Message,
  Planet,
  FiSend as Sent,
  FiThumbsUp as Upvote,
} from "@votewise/ui/icons";

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

import { timeAgo } from "lib/date";
import { useGetMyPosts } from "lib/hooks/useGetMyPosts";
import { parsePostStatus } from "lib/parsePostStatus";
import { getServerSession } from "server/lib/getServerSession";

import { getMyPosts } from "server/services/user";

type PostStatus = "open" | "closed" | "archived" | "inprogress";

type PostCardProps = {
  post: GetMyPostsResponse["data"]["posts"][0];
  postStatus: PostStatus;
};

type IndicatorProps = {
  isSelected: boolean;
};
function Indicator(props: IndicatorProps) {
  const { isSelected } = props;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill={isSelected ? "#51CF66" : "#6B7280"} />
      <circle cx="8" cy="8" r="3" fill="#F9FAFB" />
    </svg>
  );
}

type DropdownProps = {
  selected: PostStatus;
  onFilterChange: (status: PostStatus) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onArchive: () => void;
};

type FilterDropdownProps = {
  selected: PostStatus;
  onFilterChange: (status: PostStatus | "orderBy") => void;
};

function FilterDropdown(props: FilterDropdownProps) {
  // TODO: Can implement Control props pattern to make this more reusable
  const { onFilterChange, selected } = props;

  const handleOnDropdownItemClick = (status: PostStatus | "orderBy") => {
    onFilterChange?.(status);
  };

  return (
    <DropdownMenu>
      <DropdownButton>
        <Badge type="primary" className="flex items-center gap-2 rounded py-1">
          <span>
            <FiFilter className="h-5 w-5 text-gray-50" />
          </span>
          <span className="text-gray-50">Filters</span>
        </Badge>
      </DropdownButton>
      <DropdownTransition>
        <DropdownMenuItems>
          <DropdownMenuItemsGroup>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("open")}
            >
              <span>
                <Indicator isSelected={selected === "open"} />
              </span>
              <span>Open</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("closed")}
            >
              <span>
                <Indicator isSelected={selected === "closed"} />
              </span>
              <span>Closed</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("inprogress")}
            >
              <span>
                <Indicator isSelected={selected === "inprogress"} />
              </span>
              <span>In progress</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
          <div className="w-full rounded-full border border-gray-200" />
          <DropdownMenuItemsGroup>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("orderBy")}
            >
              <span>
                <FiClock className="h-5 w-5 text-gray-500" />
              </span>
              <span>Time</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
        </DropdownMenuItems>
      </DropdownTransition>
    </DropdownMenu>
  );
}

function PostDropdown(props: DropdownProps) {
  const { selected = "open", onFilterChange, onArchive, onDelete, onUpdate } = props;

  const handleOnDropdownItemClick = (status: PostStatus) => {
    onFilterChange(status);
  };

  return (
    <DropdownMenu>
      <DropdownButton>
        <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
      </DropdownButton>
      <DropdownTransition>
        <DropdownMenuItems>
          <DropdownMenuItemsGroup>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("open")}
            >
              <span>
                <Indicator isSelected={selected === "open"} />
              </span>
              <span>Open</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("closed")}
            >
              <span>
                <Indicator isSelected={selected === "closed"} />
              </span>
              <span>Closed</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("inprogress")}
            >
              <span>
                <Indicator isSelected={selected === "inprogress"} />
              </span>
              <span>In progress</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
          <div className="w-full rounded-full border border-gray-200" />
          <DropdownMenuItemsGroup>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onUpdate}>
              <span>
                <FiEdit2 className="h-5 w-5 text-gray-500" />
              </span>
              <span>Update</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onDelete}>
              <span>
                <FiTrash2 className="h-5 w-5 text-gray-500" />
              </span>
              <span>Delete</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onArchive}>
              <span>
                <FiArchive className="h-5 w-5 text-gray-500" />
              </span>
              <span>Archive</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
        </DropdownMenuItems>
      </DropdownTransition>
    </DropdownMenu>
  );
}

function PostCard(props: PostCardProps) {
  const { post, postStatus } = props;
  const [selected, setSelected] = useState<PostStatus>("open");
  const [open, setOpen] = useState(false);
  const parsedText = parseHashTags(post.content);

  const handleOnUpdate = () => {
    setOpen(true);
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
          <PostDropdown
            selected={post.status.toLowerCase() as PostStatus}
            onFilterChange={() => {}}
            onDelete={() => {}}
            onUpdate={handleOnUpdate}
            onArchive={() => {}}
          />
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
        <UpdatePost setOpen={setOpen} post={post} postStatus={postStatus} />
      </Modal>
    </Post>
  );
}

export default function Page() {
  const [postStatus, setPostStatus] = useState<PostStatus>("open");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetMyPosts(
    postStatus,
    orderBy
  );

  const handleOnFilterChange = (s: PostStatus | "orderBy") => {
    if (s === "orderBy") {
      setOrderBy((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setPostStatus(s);
  };

  return (
    <div className="min-w-[calc((774/16)*1rem)]">
      {/* Profile tabs */}
      <div className="mb-10 flex items-center">
        <ul className="flex items-center gap-4">
          <li>
            <button type="button">
              <Badge type="primary">Posts</Badge>
            </button>
          </li>
          <li>
            <button type="button">
              <Badge type="secondary">Comments</Badge>
            </button>
          </li>
          <li>
            <button type="button">
              <Badge type="secondary">Archived</Badge>
            </button>
          </li>
          <li>
            <button type="button">
              <Badge type="secondary">Friends</Badge>
            </button>
          </li>
          <li>
            <button type="button">
              <Badge type="secondary">Groups</Badge>
            </button>
          </li>
        </ul>
        <div className="ml-auto">
          <FilterDropdown selected={postStatus} onFilterChange={handleOnFilterChange} />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {status === "loading" && isFetching && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Spinner className="h-6 w-6" />
            <span className="text-lg font-semibold text-gray-600">Loading...</span>
          </div>
        )}

        {data?.pages[0].data.posts.length === 0 && status !== "loading" && (
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
                <PostCard post={post} key={post.id} postStatus={postStatus} />
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
    </div>
  );
}

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
