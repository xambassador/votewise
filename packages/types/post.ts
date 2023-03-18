import type { BaseResponse } from "./base";

type CommentOnPostPayload = {
  text: string;
};

type UpdateCommentOnPostPayload = {
  text: string;
};

type ReplyToCommentOnPostPayload = {
  text: string;
};

type PostType = "PUBLIC" | "GROUP_ONLY";
type PostStatus = "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";

type CreatePostPayload = {
  title: string;
  content: string;
  type?: PostType;
  status: PostStatus;
  groupId?: number;
  postAssets?: {
    url: string;
    type: string;
  }[];
};

type UpdatePostPayload = {
  title: string;
  content: string;
  type?: PostType;
  status: PostStatus;
  groupId?: number;
};

type ChangeStatusPayload = {
  status: PostStatus;
};

type CreatePostResponse = {
  data: {
    message: string;
    post: {
      id: number;
      author_id: number;
      title: string;
      content: string;
      slug: string;
      type: PostType;
      status: PostStatus;
      group_id: number | null;
      created_at: Date;
      updated_at: Date;
    };
  };
} & BaseResponse;

type GetPostsResponse = {
  data: {
    message: string;
    posts: {
      comments_count: number;
      upvotes_count: number;
      id: number;
      author_id: number;
      title: string;
      content: string;
      slug: string;
      type: PostType;
      status: PostStatus;
      group_id: number | null;
      created_at: Date;
      updated_at: Date;
      post_assets: {
        url: string;
      }[];
      author: {
        profile_image: string;
        name: string;
        location: string;
      };
    }[];
    meta: {
      pagination: {
        total: number;
        limit: number;
        next: number;
        isLastPage: boolean;
      };
    };
  };
} & BaseResponse;

export type {
  CommentOnPostPayload,
  UpdateCommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  CreatePostPayload,
  UpdatePostPayload,
  ChangeStatusPayload,
  GetPostsResponse,
  CreatePostResponse,
};
