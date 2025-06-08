import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { GetAllTopicsResponse } from "@votewise/client/onboard";
import type { GetMeResponse } from "@votewise/client/user";

export type Feed = GetAllFeedsResponse["feeds"][0];
export type Me = GetMeResponse;
export type Topic = GetAllTopicsResponse["topics"][0];
export type Topics = GetAllTopicsResponse["topics"];
