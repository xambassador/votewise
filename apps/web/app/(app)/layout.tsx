import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { SuggestionPanel } from "@/components/suggestion-panel";
import { UserProvider } from "@/components/user-provider";

import { isAuthorized } from "@/lib/auth";
import { getOnboard, getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
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
  if (!res.success) {
    throw new Error(res.error);
  }
  const me = res.data;

  return (
    <UserProvider user={me}>
      <div className="min-h-screen max-w-8xl mx-auto flex justify-between">
        <Sidebar name={me.first_name + " " + me.last_name} avatarUrl={me.avatar_url} />
        <main className="flex-1">{props.children}</main>
        <SuggestionPanel />
      </div>
    </UserProvider>
  );
}
