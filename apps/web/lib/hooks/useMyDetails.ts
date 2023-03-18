import type { AxiosError } from "axios";

import { useQuery } from "react-query";

import type { ErrorResponse } from "@votewise/types";

import { getMyDetails } from "services/user";

const fetcher = () => getMyDetails();
type Response = Awaited<ReturnType<typeof fetcher>>;

export const useMyDetails = () => useQuery<Response, AxiosError<ErrorResponse>>("user-info", fetcher);
