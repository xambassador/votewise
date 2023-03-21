import type { AxiosError } from "axios";

import { useQuery } from "react-query";

import type { ErrorResponse } from "@votewise/types";

import { getMyDetails } from "services/user";

const fetcher = () => getMyDetails();
type Response = Awaited<ReturnType<typeof fetcher>>;

/**
 * @description This hook is used to fetch current logged in user details
 * @returns
 */
export const useMyDetails = () => useQuery<Response, AxiosError<ErrorResponse>>("user-info", fetcher);
