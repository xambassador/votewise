import dayjs from "dayjs";
import plugin from "dayjs/plugin/relativeTime";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";
import { useQuery } from "react-query";

import { parseHashTags } from "@votewise/lib/hashtags";
import type { GetPostsResponse } from "@votewise/types";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import {
  ButtonGroup,
  Layout,
  Post,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostText,
  PostTitle,
  PostUserPill,
} from "components";

import { getServerSession } from "server/lib/getServerSession";

import { getPosts } from "server/services/post";
import { getPosts as fetchPosts } from "services/post";

dayjs.extend(plugin);

type Props = {
  data: GetPostsResponse;
};

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
              {hashtag}
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

export default function Home(props: Props) {
  const { data: initialData } = props;
  const { data } = useQuery("posts", fetchPosts, {
    initialData,
  });

  // TODO: Store posts in zustand store

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {data?.data.posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </Layout>
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

  const response = await getPosts(session.accessToken);

  return {
    props: {
      data: response.data,
      session,
    },
  };
};
