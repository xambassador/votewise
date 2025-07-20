import type { GetCommentsResponse } from "@votewise/client/comment";
import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { GetAllGroupsResponse } from "@votewise/client/group";
import type { GetAllTopicsResponse } from "@votewise/client/onboard";
import type { GetMeResponse } from "@votewise/client/user";

export type Feed = GetAllFeedsResponse["feeds"][0];
export type Me = GetMeResponse;
export type Topic = GetAllTopicsResponse["topics"][0];
export type Topics = GetAllTopicsResponse["topics"];
export type Comment = GetCommentsResponse["comments"][0];
export type Comments = GetCommentsResponse["comments"];
export type Group = GetAllGroupsResponse["groups"][0];
export type Groups = GetAllGroupsResponse["groups"];
