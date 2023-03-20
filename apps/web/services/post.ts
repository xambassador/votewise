import type { AxiosResponse } from "axios";

import type {
  CreateCommentResponse,
  DeleteCommentResponse,
  GetPostCommentsResponse,
  GetPostResponse,
  GetPostsResponse,
  GetRepliesResponse,
  LikePostResponse,
  ReplyToCommentResponse,
  UnLikePostResponse,
  UpdateCommentResponse,
} from "@votewise/types";

import { axioInstance } from "lib/axios";

/**
 * @description Get all posts
 * @returns
 */
export const getPosts = async (limit = 5, offset = 0) => {
  const apiEndpoint = `/posts?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostsResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Get post details
 * @param postId Post id to get details for
 */
export const getPost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}`;
  const response: AxiosResponse<GetPostResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Like post
 * @param postId Post id to like
 */
export const likePost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}/like`;
  const response: AxiosResponse<LikePostResponse> = await axioInstance.patch(apiEndpoint, {
    postId,
    type: "LIKE",
  });
  return response.data;
};

/**
 * @description Unlike post
 * @param postId Post id to unlike
 */
export const unlikePost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}/unlike`;
  const response: AxiosResponse<UnLikePostResponse> = await axioInstance.patch(apiEndpoint, {
    postId,
    type: "UNLIKE",
  });
  return response.data;
};

/**
 * @description Comment on post
 * @param postId Post id to comment on
 * @param comment Comment to post
 */
export const commentOnPost = async (postId: number, comment: string) => {
  const apiEndpoint = `/posts/${postId}/comment`;
  const response: AxiosResponse<CreateCommentResponse> = await axioInstance.post(apiEndpoint, {
    postId,
    text: comment,
  });
  return response.data;
};

/**
 * @description Get comments for post
 * @param postId Post id to get comments from
 * @param limit Limit of comments to get
 * @param offset Offset of comments to get
 */
export const getCommentsForPost = async (postId: number, limit = 5, offset = 0) => {
  const apiEndpoint = `/posts/${postId}/comments?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostCommentsResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Update comment
 * @param postId Post id to update comment on
 * @param commentId Comment id to update
 * @param comment Comment to update with
 */
export const updateComment = async (postId: number, commentId: number, comment: string) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}`;
  const response: AxiosResponse<UpdateCommentResponse> = await axioInstance.patch(apiEndpoint, {
    text: comment,
  });
  return response.data;
};

/**
 * @description Reply to comment
 * @param postId Post id to reply to
 * @param commentId Comment id to reply to
 * @param comment Comment to reply with
 */
export const replyToComment = async (postId: number, commentId: number, comment: string) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}/reply`;
  const response: AxiosResponse<ReplyToCommentResponse> = await axioInstance.post(apiEndpoint, {
    text: comment,
  });
  return response.data;
};

/**
 * @description Get replies for comment
 * @param postId Post id to get replies from
 * @param commentId Comment id to get replies from
 * @param limit Limit of replies to get
 * @param offset Offset of replies to get
 * @returns
 */
export const getReplies = async (postId: number, commentId: number, limit = 5, offset = 0) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}/replies?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetRepliesResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Delete comment
 * @param postId Post id to delete comment from
 * @param commentId Comment id to delete
 * @returns
 */
export const deleteComment = async (postId: number, commentId: number) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}/delete`;
  const response: AxiosResponse<DeleteCommentResponse> = await axioInstance.delete(apiEndpoint);
  return response.data;
};
