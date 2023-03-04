type CommentOnPostPayload = {
  text: string;
};

type UpdateCommentOnPostPayload = {
  text: string;
};

type ReplyToCommentOnPostPayload = {
  text: string;
};

type CreatePostPayload = {
  title: string;
  content: string;
  type?: "PUBLIC" | "GROUP_ONLY";
  status: "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";
  groupId?: number;
};

type UpdatePostPayload = {
  title: string;
  content: string;
  type?: "PUBLIC" | "GROUP_ONLY";
  status: "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";
  groupId?: number;
};

export type {
  CommentOnPostPayload,
  UpdateCommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  CreatePostPayload,
  UpdatePostPayload,
};
