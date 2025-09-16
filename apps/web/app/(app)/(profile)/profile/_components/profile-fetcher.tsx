import type { GetMeResponse, GetUserProfileResponse } from "@votewise/client/user";

import { Error } from "@votewise/ui/error";

import { getUserClient } from "@/lib/client.server";

type ProfileFetcherProps = {
  username: string;
  children: (result: GetUserProfileResponse) => React.ReactNode;
};

export async function ProfileFetcher(props: ProfileFetcherProps) {
  const { children, username } = props;
  const user = getUserClient();
  const userResult = await user.getUser(username);
  if (!userResult.success) {
    return <Error error={userResult.error} />;
  }
  return <>{children(userResult.data)}</>;
}

type MyProfileFetcherProps = {
  children: (result: GetMeResponse) => React.ReactNode;
};

export async function MyProfileFetcher(props: MyProfileFetcherProps) {
  const { children } = props;
  const user = getUserClient();
  const userResult = await user.getMe();
  if (!userResult.success) {
    return <Error error={userResult.error} />;
  }
  return <>{children(userResult.data)}</>;
}
