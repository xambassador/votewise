import { useStore } from "zustand";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { QueryClient, dehydrate, useQuery, useQueryClient } from "react-query";

import { classNames } from "@votewise/lib";
import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetPostCommentsResponse, GetPostResponse } from "@votewise/types";
import {
  Avatar,
  Button,
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownTransition,
  Spinner,
  makeToast,
} from "@votewise/ui";
import {
  FiTrash2 as DeleteIcon,
  FiMessageCircle as Message,
  FiEdit2 as PencilIcon,
  FiSend as Sent,
  FiThumbsUp as Upvote,
  FiXCircle as XCircle,
} from "@votewise/ui/icons";

import { ButtonGroup } from "components";
import {
  Post,
  PostAddCommentInput,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostStatuPill,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";
import {
  Comment,
  CommentActions,
  CommentBody,
  CommentHeader,
  CommentSeparator,
  CommentText,
  CommentsWrapper,
} from "components/post/comments";

import { timeAgo } from "lib/date";
import { useCommentMutation } from "lib/hooks/useCommentMutation";
import { useGetComments } from "lib/hooks/useGetComments";
import { useLikeMutation } from "lib/hooks/useLikeMutation";
import { useUnLikeMutation } from "lib/hooks/useUnlikeMutation";
import { parsePostStatus } from "lib/parsePostStatus";
import store from "lib/store";
import type { User } from "lib/store";
import { getServerSession } from "server/lib/getServerSession";

import { getPost, getPostComments } from "server/services/post";
import { getPost as fetchPost } from "services/post";

type Props = {
  postId: number;
  user: User | null;
};

type PageProps = {
  postId: number;
};

type PostCommentProps = {
  comment: GetPostCommentsResponse["data"]["comments"][0];
  user: User | null;
};

type PostAddCommentProps = {
  user: User | null;
  post: GetPostResponse["data"]["post"];
};

type PostCommentsProps = {
  user: User | null;
  postId: number;
};

function PostComment(props: PostCommentProps) {
  const { user, comment } = props;
  const [toggle, setToggle] = useState(false);

  const handleOnDropDownItemClick = (action: "DELETE" | "UPDATE") => {
    if (action === "UPDATE") {
      setToggle(true);
    }
  };

  return (
    <Comment>
      <CommentHeader>
        <Avatar src={comment.user.profile_image} width={48} height={48} rounded className="flex-[0_0_48px]" />
        <span className="text-base font-medium text-gray-800">{comment.user.name}</span>
        <span className="text-sm text-gray-600">{timeAgo(comment.updated_at)}</span>

        {user?.id === comment.user_id && (
          // TODO: Move this to a separate component and use it here
          <DropdownMenu className="ml-auto">
            <DropdownButton>
              <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
            </DropdownButton>
            <DropdownTransition>
              <DropdownMenuItems>
                <DropdownMenuItem
                  className="gap-2"
                  as="button"
                  onClick={() => handleOnDropDownItemClick("UPDATE")}
                >
                  <PencilIcon className="h-5 w-5 text-gray-500" />
                  <span>Update</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  as="button"
                  onClick={() => handleOnDropDownItemClick("DELETE")}
                >
                  <DeleteIcon className="h-5 w-5 text-gray-500" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuItems>
            </DropdownTransition>
          </DropdownMenu>
        )}
      </CommentHeader>

      <CommentBody>
        <CommentSeparator />
        <div className="ml-3 flex w-full flex-col gap-2">
          {!toggle && <CommentText>{comment.text}</CommentText>}
          {toggle && (
            <PostAddCommentInput
              className="w-full"
              name="comment"
              placeholder="Add your comment"
              value={comment.text}
              isLoading={false}
              formProps={{ className: "mb-2" }}
            />
          )}
          <CommentActions upvoteText={comment.upvotes_count}>
            {toggle && (
              <ButtonGroup>
                <button type="button" className="flex items-center gap-1" onClick={() => setToggle(false)}>
                  <span>
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </span>
                  <span className="text-sm text-gray-600">Cancel</span>
                </button>
              </ButtonGroup>
            )}
          </CommentActions>
        </div>
      </CommentBody>
    </Comment>
  );
}

function PostComments(props: PostCommentsProps) {
  const { user, postId } = props;
  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: commentsStatus,
  } = useGetComments(postId);

  return (
    <CommentsWrapper>
      {(commentsStatus !== "loading" || !isFetching) &&
        comments?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {page.data.comments.length === 0 && (
              <div>
                <h2 className="text-center text-lg font-semibold text-gray-600">No comments yet</h2>
              </div>
            )}
            {page.data.comments.length > 0 &&
              page.data.comments.map((c) => <PostComment key={c.id} comment={c} user={user} />)}
            {page.data.comments.length > 0 && (
              <Button
                className="bg-gray-800 py-3 text-gray-50 disabled:bg-gray-800"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                isLoading={isFetchingNextPage || isFetching}
              >
                {hasNextPage && "Load more discussions"}
                {!hasNextPage && "No more discussions"}
              </Button>
            )}
          </React.Fragment>
        ))}
    </CommentsWrapper>
  );
}

function PostAddComment(props: PostAddCommentProps) {
  const { user, post } = props;
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  function handleError(err: any) {
    const message = err?.response.data.error.message || "Something went wrong";
    makeToast(message, "error");
  }

  const commentMutation = useCommentMutation(comment, queryClient, user as User, {
    onSuccess: () => setComment(""),
    onError: handleError,
  });

  const handleOnAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment) {
      makeToast("Comment should not be empty", "warning");
      return;
    }
    commentMutation.mutate(post.id);
  };

  return (
    <div className="flex gap-7">
      <Avatar
        src={user?.profile_image as string}
        width={48}
        height={48}
        rounded
        className="flex-[0_0_48px]"
      />
      <PostAddCommentInput
        name="comment"
        placeholder="Add your comment"
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        formProps={{
          onSubmit: handleOnAddComment,
        }}
        isLoading={commentMutation.isLoading}
        disabled={commentMutation.isLoading || post.status === "CLOSED"}
      />
    </div>
  );
}

function PostDetails(props: Props) {
  const { postId, user } = props;
  const queryClient = useQueryClient();
  const { data, status } = useQuery(["post", postId], () => fetchPost(postId), {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  function handleError(err: any) {
    const message = err?.response.data.error.message || "Something went wrong";
    makeToast(message, "error");
  }

  const likeMutation = useLikeMutation(queryClient, user as User, {
    onError: handleError,
  });

  const unlikeMutation = useUnLikeMutation(queryClient, user as User, {
    onError: handleError,
  });

  const handleOnLike = () => {
    if (data?.data.post.upvotes.find((upvote) => upvote.user_id === user?.id)) {
      unlikeMutation.mutate(postId);
      return;
    }
    likeMutation.mutate(postId);
  };

  return (
    <div>
      {status === "loading" && (
        <div className="mx-auto mb-2 flex w-fit flex-col items-center gap-2">
          <Spinner />
          <span className="font-semibold text-gray-600">Loading post</span>
        </div>
      )}
      {status === "success" && (
        <Post>
          <PostUserPill
            avatar={data.data.post.author.profile_image}
            location={data.data.post.author.location}
            timeAgo={timeAgo(data.data.post.updated_at)}
            userName={data.data.post.author.name}
          >
            <div className="flex h-fit items-center gap-4">
              <PostStatuPill type={parsePostStatus(data.data.post.status)}>
                {data.data.post.status}
              </PostStatuPill>

              {user?.id === data.data.post.author_id && (
                <button type="button">
                  <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
                </button>
              )}
            </div>
          </PostUserPill>
          <PostTitle>
            <Link href={`/post/${data.data.post.id}`}>{data.data.post.title}</Link>
          </PostTitle>
          <PostGallary images={data.data.post.post_assets} />
          <PostText>{parseHashTags(data.data.post.content).text}</PostText>
          {parseHashTags(data.data.post.content).hashtags.length > 0 && (
            <PostHashTags>
              {parseHashTags(data.data.post.content).hashtags.map((hashTag) => (
                <Link href={`/hashtag/${12}`} key={hashTag}>
                  #{hashTag}{" "}
                </Link>
              ))}
            </PostHashTags>
          )}
          <PostFooter>
            <ButtonGroup>
              <button
                type="button"
                disabled={data.data.post.status === "CLOSED"}
                className="disabled:cursor-not-allowed"
                onClick={handleOnLike}
              >
                <Upvote
                  className={classNames(
                    "h-5 w-5",
                    data.data.post.upvotes.find((item) => item.user_id === user?.id)
                      ? "text-blue-700"
                      : "text-gray-500"
                  )}
                />
              </button>
              <span className="text-sm text-gray-600">{data.data.post.upvotes_count}</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Message className="h-5 w-5 text-gray-500" />
              </span>
              <span className="text-sm text-gray-600">{data.data.post.comments_count} Comments</span>
            </ButtonGroup>
            <ButtonGroup>
              <span>
                <Sent className="h-5 w-5 text-gray-500" />
              </span>
              <span className="text-sm text-gray-600">Share</span>
            </ButtonGroup>
          </PostFooter>

          <PostAddComment user={user} post={data.data.post} />
          <PostComments user={user} postId={postId} />
        </Post>
      )}
    </div>
  );
}

export default function Page(props: PageProps) {
  const { postId } = props;
  const user = useStore(store, (state) => state.user);
  return <PostDetails user={user} postId={postId} />;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res, params } = context;
  const session = await getServerSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  if (!params?.id) {
    return {
      notFound: true,
    };
  }

  const postId = Number(params.id);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["post", postId], async () => {
    const { data } = await getPost(session.accessToken, postId);
    return data;
  });
  await queryClient.prefetchInfiniteQuery(["comments", postId], async () => {
    const { data } = await getPostComments(session.accessToken, postId, 5, 0);
    return data;
  });
  const dehydratedClient = dehydrate(queryClient);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  dehydratedClient.queries[1].state.data.pageParams = [null];

  return {
    props: {
      dehydratedState: dehydratedClient,
      postId,
    },
  };
};
