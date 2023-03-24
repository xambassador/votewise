import { useMutation } from "react-query";
import type { QueryClient } from "react-query";

import type { UpdatePostStatusResponse } from "@votewise/types";

import { updatePostStatus } from "services/user";

type Variables = {
  postId: number;
  status: "open" | "closed" | "archived" | "inprogress";
};

type Options = {
  onSuccess?: (data: UpdatePostStatusResponse, variables: Variables, context: unknown) => void;
  onError?: (error: any, variables: Variables, context: unknown) => void;
};

export function usePostChangeStatusMutation(queryClient: QueryClient, options?: Options) {
  return useMutation((data: Variables) => updatePostStatus(data.postId, data.status), {
    onMutate: (data) => {},
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
}
