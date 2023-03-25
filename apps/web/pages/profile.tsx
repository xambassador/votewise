import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React, { useRef, useState } from "react";
import { QueryClient, dehydrate, useQueryClient } from "react-query";

import { classNames } from "@votewise/lib";
import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetMyPostsResponse } from "@votewise/types";
import { Badge, Button, Modal, Spinner, makeToast } from "@votewise/ui";
import { FiMessageCircle as Message, Planet, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

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

import { timeAgo } from "lib/date";
import { useDeletePostMutation } from "lib/hooks/useDeltePostMutation";
import { useGetMyPosts } from "lib/hooks/useGetMyPosts";
import { usePostChangeStatusMutation } from "lib/hooks/usePostChangeStatusMutation";
import { parsePostStatus } from "lib/parsePostStatus";
import { getServerSession } from "server/lib/getServerSession";

import { getMyPosts } from "server/services/user";

type PostStatus = "open" | "closed" | "archived" | "inprogress";
type PostType = GetMyPostsResponse["data"]["posts"][0];

type PostCardProps = {
  post: PostType;
  postStatus: PostStatus;
  orderBy: "asc" | "desc";
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
              onArchive={() => {}}
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

  const handleOnPostDelete = (post: PostType) => {
    makeToast(`Your post "${post.title} has been removed."`, "success");
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
          <FilterDropdown selected={postStatus} onFilterChange={handleOnFilterChange} orderBy={orderBy} />
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
