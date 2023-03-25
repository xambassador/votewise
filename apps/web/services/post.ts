import type { AxiosResponse } from "axios";

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

import { axiosInstance } from "lib/axios";

/**
 * @description Get all posts
 * @returns
 */
export const getPosts = async (limit = 5, offset = 0) => {
  const apiEndpoint = `/posts?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostsResponse> = await axiosInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Get post details
 * @param postId Post id to get details for
 */
export const getPost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}`;
  const response: AxiosResponse<GetPostResponse> = await axiosInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Like post
 * @param postId Post id to like
 */
export const likePost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}/like`;
  const response: AxiosResponse<LikePostResponse> = await axiosInstance.patch(apiEndpoint, {
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
  const response: AxiosResponse<UnLikePostResponse> = await axiosInstance.patch(apiEndpoint, {
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
  const response: AxiosResponse<CreateCommentResponse> = await axiosInstance.post(apiEndpoint, {
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
  const response: AxiosResponse<GetPostCommentsResponse> = await axiosInstance.get(apiEndpoint);
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
  const response: AxiosResponse<UpdateCommentResponse> = await axiosInstance.patch(apiEndpoint, {
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
  const response: AxiosResponse<ReplyToCommentResponse> = await axiosInstance.post(apiEndpoint, {
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
  const response: AxiosResponse<GetRepliesResponse> = await axiosInstance.get(apiEndpoint);
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
  const response: AxiosResponse<DeleteCommentResponse> = await axiosInstance.delete(apiEndpoint);
  return response.data;
};

/**
 * @description Like comment
 * @param postId Post id to like comment on
 * @param commentId Comment id to like
 */
export const likeComment = async (postId: number, commentId: number) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}/like`;
  const response: AxiosResponse<LikeCommentResponse> = await axiosInstance.patch(apiEndpoint);
  return response.data;
};

/**
 * @description Unlike comment
 * @param postId Post id to unlike comment on
 * @param commentId Comment id to unlike
 */
export const unlikeComment = async (postId: number, commentId: number) => {
  const apiEndpoint = `/posts/${postId}/comments/${commentId}/unlike`;
  const response: AxiosResponse<UnLikeCommentResponse> = await axiosInstance.delete(apiEndpoint);
  return response.data;
};
