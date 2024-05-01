import type {
  CreateCommentResponse,
  DeleteCommentResponse,
  GetPostCommentsResponse,
  GetPostResponse,
  GetPostsResponse,
  GetRepliesResponse,
  LikeCommentResponse,
  LikePostResponse,
  ReplyToCommentResponse,
  UnLikeCommentResponse,
  UnLikePostResponse,
  UpdateCommentResponse,
} from "@votewise/types";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { getAxiosServerWithAuth } from "server/lib/axios";

import {
  COMMENT_ON_POST_V1,
  DELETE_COMMENT_ON_POST_V1,
  GET_POST_COMMENTS_V1,
  GET_POST_V1,
  GET_POSTS_V1,
  GET_REPLIES_TO_COMMENT_ON_POST_V1,
  LIKE_COMMENT_ON_POST_V1,
  LIKE_POST_V1,
  POST_ROUTE_V1,
  REPLY_TO_COMMENT_ON_POST_V1,
  UNLIKE_COMMENT_ON_POST_V1,
  UNLIKE_POST_V1,
  UPDATE_COMMENT_ON_POST_V1,
} from "@votewise/lib/routes";

/**
 * @description Get all posts
 * @param token Access token
 */
export const getPosts = async (
  token: string,
  limit: number,
  offset: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POSTS_V1}?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostsResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};

/**
 * @description Like a post
 */
export const likePost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${LIKE_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<LikePostResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    {},
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Unlike a post
 */
export const unlikePost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${UNLIKE_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<UnLikePostResponse> = await getAxiosServerWithAuth(token).delete(
    apiEndpoint,
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Get post details
 */
export const getPost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<GetPostResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};

/**
 * @description Add comment to post
 * @param token Access token
 * @param postId Post id
 * @param comment Comment text
 * @param options Axios request options
 * @returns
 */
export const commentOnPost = async (
  token: string,
  postId: number,
  comment: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${COMMENT_ON_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<CreateCommentResponse> = await getAxiosServerWithAuth(token).post(
    apiEndpoint,
    {
      text: comment,
    },
    {
      headers: options?.headers,
    }
  );

  return response;
};

/**
 * @description Get comments of a post
 * @param token Access token
 * @param postId Post id
 * @param limit Limit of comments to fetch
 * @param offset Offset of comments to start fetching from
 * @param options Axios request options
 * @returns
 */
export const getPostComments = async (
  token: string,
  postId: number,
  limit: number,
  offset: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POST_COMMENTS_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<GetPostCommentsResponse> = await getAxiosServerWithAuth(token).get(
    apiEndpoint,
    {
      headers: options?.headers,
      params: {
        limit,
        offset,
      },
    }
  );
  return response;
};

/**
 * @description Update comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param comment Comment text
 * @param options Axios request options
 * @returns
 */
export const updateCommentOnPost = async (
  token: string,
  postId: number,
  commentId: number,
  comment: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${UPDATE_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<UpdateCommentResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    {
      text: comment,
    },
    {
      headers: options?.headers,
    }
  );

  return response;
};

/**
 * @description Reply to comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param comment Comment text
 * @param options Axios request options
 * @returns
 */
export const replyToComment = async (
  token: string,
  postId: number,
  commentId: number,
  comment: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${REPLY_TO_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<ReplyToCommentResponse> = await getAxiosServerWithAuth(token).post(
    apiEndpoint,
    {
      text: comment,
    },
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Get replies of a comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param limit Limit of replies to get
 * @param offset Offset of replies to start from
 * @param options
 * @returns
 */
export const getRepliesToComment = async (
  token: string,
  postId: number,
  commentId: number,
  limit: number,
  offset: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_REPLIES_TO_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<GetRepliesResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
    params: {
      limit,
      offset,
    },
  });

  return response;
};

/**
 * @description Delete comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param options Axios request options
 * @returns
 */
export const deleteComment = async (
  token: string,
  postId: number,
  commentId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${DELETE_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<DeleteCommentResponse> = await getAxiosServerWithAuth(token).delete(
    apiEndpoint,
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Like a comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param options Axios request options
 * @returns
 */
export const likeComment = async (
  token: string,
  postId: number,
  commentId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${LIKE_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<LikeCommentResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    {},
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Unlike a comment on post
 * @param token Access token
 * @param postId Post id
 * @param commentId Comment id
 * @param options Axios request options
 * @returns
 */
export const unlikeComment = async (
  token: string,
  postId: number,
  commentId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${UNLIKE_COMMENT_ON_POST_V1}`
    .replace(":postId", postId.toString())
    .replace(":commentId", commentId.toString());
  const response: AxiosResponse<UnLikeCommentResponse> = await getAxiosServerWithAuth(token).delete(
    apiEndpoint,
    {
      headers: options?.headers,
    }
  );
  return response;
};
