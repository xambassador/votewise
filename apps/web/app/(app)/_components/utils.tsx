import type { Me } from "@/types";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getOnboard, getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

type Props = {
  children: (props: { user: Me }) => React.ReactNode;
};

export async function AuthenticatedLayout(props: Props) {
  const { children } = props;
  const user = isAuthorized<true>({ redirect: true });
  if (user.aal !== user.user_aal_level) {
    return redirect(routes.auth.verify2FA());
  }

  const onboard = getOnboard();
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

  return <>{children({ user: me })}</>;
}
