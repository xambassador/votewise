import { useMutation } from "react-query";
import type { QueryClient } from "react-query";

import type { DeleteCommentResponse } from "@votewise/types";

import { deleteComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
};

type Options = {
  onSuccess?: (data: DeleteCommentResponse, variables: Variables, context: unknown) => void;
  onError?: (error: any, variables: Variables, context: unknown) => void;
};

export function useDeleteMutation(queryClient: QueryClient, options?: Options) {
  return useMutation((data: Variables) => deleteComment(data.postId, data.commentId), {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["comments", variables.postId]);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
}
