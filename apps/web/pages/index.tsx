import dayjs from "dayjs";
import plugin from "dayjs/plugin/relativeTime";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";
import { QueryClient, dehydrate } from "react-query";

import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetPostsResponse } from "@votewise/types";
import { Button } from "@votewise/ui";
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
} from "components";

import { usePosts } from "lib/hooks/usePosts";
import { getServerSession } from "server/lib/getServerSession";

import { getPosts } from "server/services/post";

dayjs.extend(plugin);

type PostType = GetPostsResponse["data"]["posts"][0];

function PostCard(props: { post: PostType }) {
  const { post } = props;
  const parsedText = parseHashTags(post.content);

  return (
    <Post>
      <PostUserPill
        avatar={post.author.profile_image}
        location={post.author.location}
        timeAgo={dayjs(post.updated_at).fromNow()}
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
          <span>
            <Upvote className="h-5 w-5 text-gray-500" />
          </span>
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
