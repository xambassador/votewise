import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { GetMeResponse } from "@votewise/client/user";

export type Feed = GetAllFeedsResponse["feeds"][0];
export type Me = GetMeResponse;
