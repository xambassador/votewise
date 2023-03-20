import type { BaseResponse, Pagination } from "./base";

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
      upvotes: {
        user_id: number;
        id: number;
      }[];
      author: {
        profile_image: string;
        name: string;
        location: string;
      };
    }[];
    meta: Pagination;
  };
} & BaseResponse;

type GetPostResponse = {
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
      group_id: null | number;
      created_at: Date;
      updated_at: Date;
      profile_image: string;
      name: string;
      location: string;
      author: {
        profile_image: string;
        name: string;
        location: string;
      };
      post_assets: {
        url: string;
        type: string;
        id: number;
      }[];
      upvotes: {
        user_id: number;
        id: number;
      }[];
      upvotes_count: number;
      comments_count: number;
    };
    meta: Pagination;
  };
} & BaseResponse;

type LikePostResponse = {
  data: {
    message: string;
    post_total_upvotes: number;
  };
} & BaseResponse;

type UnLikePostResponse = {
  data: {
    message: string;
    post_total_upvotes: number;
  };
} & BaseResponse;

type CreateCommentResponse = {
  data: {
    message: string;
    comment: {
      id: number;
      parent_id: number | null;
      post_id: number;
      text: string;
      upvotes: {
        user_id: number;
        id: number;
      }[];
      user_id: number;
      upvotes_count: number;
    };
  };
} & BaseResponse;

type GetPostCommentsResponse = {
  data: {
    message: string;
    comments: {
      user: {
        name: string;
        id: number;
        profile_image: string;
      };
      parent_id: number | null;
      user_id: number;
      id: number;
      updated_at: Date;
      text: string;
      upvotes_count: number;
      num_replies: number;
    }[];
    meta: Pagination;
  };
} & BaseResponse;

type UpdateCommentResponse = {
  data: {
    message: string;
    comment: {
      id: number;
      text: string;
      user_id: number;
      parent_id: number;
      updated_at: Date;
      created_at: Date;
    };
  };
} & BaseResponse;

type ReplyToCommentResponse = UpdateCommentResponse;

type GetRepliesResponse = {
  data: {
    message: string;
    replies: {
      user: {
        id: number;
        name: string;
        profile_image: string;
      };
      upvotes: {
        user_id: number;
        id: number;
      }[];
      id: number;
      text: string;
      created_at: Date;
      updated_at: Date;
      upvotes_count: number;
    }[];
    meta: Pagination;
  };
} & BaseResponse;

type DeleteCommentResponse = {
  data: {
    message: string;
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
  LikePostResponse,
  GetPostResponse,
  UnLikePostResponse,
  CreateCommentResponse,
  PostStatus,
  PostType,
  GetPostCommentsResponse,
  UpdateCommentResponse,
  ReplyToCommentResponse,
  GetRepliesResponse,
  DeleteCommentResponse,
};
