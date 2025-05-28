import type { Me } from "@/types";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getOnboardClient, getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { UserProvider } from "./user-provider";

export type AuthorizedProps = {
  children: React.ReactNode | ((props: { user: Me }) => React.ReactNode);
};

export async function Authorized(props: AuthorizedProps) {
  const user = isAuthorized<true>({ redirect: true });
  if (user.aal !== user.user_aal_level) {
    return redirect(routes.auth.verify2FA());
  }

  const onboard = getOnboardClient();
  const onboardedResult = await onboard.isOnboarded();
  if (!onboardedResult.success) {
    throw new Error(onboardedResult.error);
  }
  if (!onboardedResult.data.is_onboarded) {
    return redirect(routes.onboard.root());
  }

  const userClient = getUserClient();
  const res = await userClient.getMe();
  if (!res.success) throw new Error(res.error);
  const me = res.data;

  if (typeof props.children === "function") {
    return <UserProvider user={me}>{props.children({ user: me })}</UserProvider>;
  }
  return <UserProvider user={me}>{props.children}</UserProvider>;
}

export function Unauthorized(props: React.PropsWithChildren) {
  const user = isAuthorized();
  if (user) return redirect(routes.app.root());
  return <>{props.children}</>;
}
