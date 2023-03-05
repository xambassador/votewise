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
  // TODO: Add a status type
  status: "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";
  groupId?: number;
};

type UpdatePostPayload = {
  title: string;
  content: string;
  type?: "PUBLIC" | "GROUP_ONLY";
  // TODO: Add a status type
  status: "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";
  groupId?: number;
};

type ChangeStatusPayload = {
  // TODO: Add a status type
  status: "OPEN" | "CLOSED" | "ARCHIVED" | "INPROGRESS";
};

export type {
  CommentOnPostPayload,
  UpdateCommentOnPostPayload,
  ReplyToCommentOnPostPayload,
  CreatePostPayload,
  UpdatePostPayload,
  ChangeStatusPayload,
};
