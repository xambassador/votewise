import { useStore } from "zustand";

import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";
import { QueryClient, dehydrate, useQuery, useQueryClient } from "react-query";

import { classNames } from "@votewise/lib";
import { parseHashTags } from "@votewise/lib/hashtags";
import { Spinner, makeToast } from "@votewise/ui";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import { PostComments } from "@/components/postDetails/comments";
import { ButtonGroup } from "components";
import {
  Post,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostStatuPill,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";
import { PostAddComment } from "components/postDetails/addComment";

import { timeAgo } from "lib/date";
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

// TODO: Replace with auth guard
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
