import { useStore } from "zustand";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";
import { QueryClient, dehydrate, useQuery } from "react-query";

import { parseHashTags } from "@votewise/lib/hashtags";
import { Avatar, Button } from "@votewise/ui";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

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
import store from "lib/store";
import { getServerSession } from "server/lib/getServerSession";

import { getPost } from "server/services/post";
import { getPost as fetchPost } from "services/post";

type Props = {
  postId: number;
};

export default function Page(props: Props) {
  const { postId } = props;
  const user = useStore(store, (state) => state.user);
  const { data, status } = useQuery(["post", postId], () => fetchPost(postId));

  return (
    <div>
      {status === "loading" && <div>Loading...</div>}
      {status === "success" && (
        <Post>
          <PostUserPill
            avatar={data.data.post.author.profile_image}
            location={data.data.post.author.location}
            timeAgo={timeAgo(data.data.post.updated_at)}
            userName={data.data.post.author.name}
          >
            <div className="flex h-fit items-center gap-4">
              {/* TODO: Make type dynamic */}
              <PostStatuPill type="success">{data.data.post.status}</PostStatuPill>
              <button type="button">
                <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
              </button>
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
              <span>
                <Upvote className="h-5 w-5 text-gray-500" />
              </span>
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

          <div className="flex gap-7">
            <Avatar
              src={user?.profile_image as string}
              width={48}
              height={48}
              rounded
              className="flex-[0_0_48px]"
            />
            <PostAddCommentInput name="comment" placeholder="Add your comment" />
          </div>

          <CommentsWrapper>
            {data.data.post.comments.length === 0 && (
              <div className="py-4 text-center">
                <h1 className="text-xl font-medium text-gray-700">No comments yet</h1>
              </div>
            )}
            {data.data.post.comments.length > 0 &&
              data.data.post.comments.map((comment) => (
                <Comment key={comment.id}>
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
                    <button type="button" className="ml-auto">
                      <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </CommentHeader>

                  <CommentBody>
                    <CommentSeparator />
                    <div className="ml-3 flex flex-col gap-2">
                      <CommentText>{comment.text}</CommentText>
                      <CommentActions />
                    </div>
                  </CommentBody>
                </Comment>
              ))}
            {!data.data.meta.pagination.isLastPage && (
              <Button className="bg-gray-800 py-3 text-gray-50">Load more discussion</Button>
            )}
          </CommentsWrapper>
        </Post>
      )}
    </div>
  );
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
  const dehydratedClient = dehydrate(queryClient);

  return {
    props: {
      dehydratedState: dehydratedClient,
      postId,
    },
  };
};
