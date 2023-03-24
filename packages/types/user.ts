import type { BaseResponse, Pagination } from "./base";
import type { PostStatus, PostType } from "./post";

type AcceptOrRejectFriendRequestPayload = {
  requestId: number;
  type: "ACCEPT" | "REJECT";
};

type UsernameAvailableResponse = {
  success: boolean;
  message: string;
  data: {
    username: string;
    message: string;
  };
  error: null;
};

type MyDetailsResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    user: {
      id: number;
      username: string;
      about: string;
      cover_image: string;
      profile_image: string;
      name: string;
      email: string;
      facebook: string;
      instagram: string;
      twitter: string;
      updated_at: string;
      last_login: Date;
      created_at: Date;
      location: string;
      is_email_verify: boolean;
      gender: "MALE" | "FEMALE" | "OTHER";
      followers: number;
      following: number;
      posts: number;
    };
  };
  error: null;
};

type GetMyPostsResponse = {
  data: {
    message: string;
    posts: {
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
      upvotes: {
        user_id: number;
        id: number;
      }[];
      post_assets: {
        url: string;
        type: string;
        id: number;
      }[];
      author: {
        profile_image: string;
        name: string;
        location: string;
      };
      comments_count: number;
      upvotes_count: number;
    }[];
    meta: Pagination;
  };
} & BaseResponse;

type DeletePostResponse = {
  data: {
    message: string;
  };
} & BaseResponse;

type UpdatePostStatusResponse = {
  data: {
    message: string;
    post: {
      id: number;
      status: PostStatus;
    };
  };
} & BaseResponse;

export type {
  AcceptOrRejectFriendRequestPayload,
  UsernameAvailableResponse,
  MyDetailsResponse,
  GetMyPostsResponse,
  DeletePostResponse,
  UpdatePostStatusResponse,
};
