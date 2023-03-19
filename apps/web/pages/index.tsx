import { useStore } from "zustand";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";
import { QueryClient, dehydrate, useMutation, useQueryClient } from "react-query";
import type { InfiniteData } from "react-query";

import { classNames } from "@votewise/lib";
import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetPostsResponse } from "@votewise/types";
import { Button, makeToast } from "@votewise/ui";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import {
  ButtonGroup,
  Post,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";

import { timeAgo } from "lib/date";
import { usePosts } from "lib/hooks/usePosts";
import store from "lib/store";
import { getServerSession } from "server/lib/getServerSession";

import { getPosts } from "server/services/post";
import { likePost, unlikePost } from "services/post";

type PostType = GetPostsResponse["data"]["posts"][0];

function PostCard(props: { post: PostType }) {
  const { post } = props;
  const user = useStore(store, (state) => state.user);
  const parsedText = parseHashTags(post.content);
  const queryClient = useQueryClient();

  const likeMutation = useMutation((postId: number) => likePost(postId), {
    onMutate: (variables) => {
      queryClient.cancelQueries("posts");
      const previousPosts = queryClient.getQueriesData("posts");
      queryClient.setQueryData<InfiniteData<GetPostsResponse>>("posts", (old) => ({
        ...(old as InfiniteData<GetPostsResponse>),
        pages: old?.pages.map((page) => ({
          ...(page as GetPostsResponse),
          data: {
            ...page.data,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            posts: page.data.posts.map((post) => {
              if (post.id === variables) {
                return {
                  ...post,
                  upvotes_count: post.upvotes_count + 1,
                  upvotes: [{ user_id: user?.id, id: 121 }, ...post.upvotes],
                };
              }
              return post;
            }),
          },
        })) as GetPostsResponse[],
      }));

      return {
        previousPosts,
      };
    },
    onSuccess: () => {},
    onError: (error: any, _, context) => {
      const message = error?.response.data.error.message || "Something went wrong";
      makeToast(message, "error");
      queryClient.setQueriesData("posts", context?.previousPosts);
    },
  });

  const unlikeMutation = useMutation((postId: number) => unlikePost(postId), {
    onMutate: (variables) => {
      queryClient.cancelQueries("posts");
      const previousPosts = queryClient.getQueriesData("posts");
      queryClient.setQueryData<InfiniteData<GetPostsResponse>>("posts", (old) => ({
        ...(old as InfiniteData<GetPostsResponse>),
        pages: old?.pages.map((page) => ({
          ...(page as GetPostsResponse),
          data: {
            ...page.data,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            posts: page.data.posts.map((post) => {
              if (post.id === variables) {
                return {
                  ...post,
                  upvotes_count: post.upvotes_count - 1,
                  upvotes: post.upvotes.filter((item) => item.user_id !== user?.id),
                };
              }
              return post;
            }),
          },
        })) as GetPostsResponse[],
      }));

      return {
        previousPosts,
      };
    },
    onSuccess: () => {},
    onError: (error: any, _, context) => {
      const message = error?.response.data.error.message || "Something went wrong";
      makeToast(message, "error");
      queryClient.setQueriesData("posts", context?.previousPosts);
    },
  });

  const handleOnPostLike = () => {
    if (post.upvotes.find((item) => item.user_id === user?.id)) {
      unlikeMutation.mutate(post.id);
      return;
    }
    likeMutation.mutate(post.id);
  };

  return (
    <Post>
      <PostUserPill
        avatar={post.author.profile_image}
        location={post.author.location}
        timeAgo={timeAgo(post.updated_at)}
        userName={post.author.name}
      />
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
          <button type="button" onClick={handleOnPostLike}>
            <Upvote
              className={classNames(
                "h-5 w-5",
                post.upvotes.find((item) => item.user_id === user?.id) ? "text-blue-700" : "text-gray-500"
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
    </Post>
  );
}

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = usePosts();

  return (
    <div className="flex flex-col gap-8">
      {(status !== "loading" || !isFetching) &&
        data?.pages?.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            {page.data.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </React.Fragment>
        ))}

      <Button
        className="bg-gray-800 py-3 text-gray-50"
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        isLoading={isFetchingNextPage || isFetching}
      >
        {hasNextPage && "Load More"}
        {!hasNextPage && "Nothing more to load"}
      </Button>
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
  await queryClient.prefetchInfiniteQuery("posts", async () => {
    const { data } = await getPosts(session.accessToken, 5, 0);
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
