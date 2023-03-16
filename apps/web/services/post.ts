import type { AxiosResponse } from "axios";

import type { GetPostsResponse } from "@votewise/types";

import { axioInstance } from "lib/axios";

export const getPosts = async () => {
  const response: AxiosResponse<GetPostsResponse> = await axioInstance.get("/posts");
  return response.data;
};
