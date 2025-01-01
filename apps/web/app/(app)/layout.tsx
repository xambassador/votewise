import { redirect } from "next/navigation";

import { NavTabs } from "@/components/nav-tabs";
import { Sidebar } from "@/components/sidebar";
import { SuggestionPanel } from "@/components/suggestion-panel";

import { auth } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  const { user } = auth<true>({ redirect: true });
  if (user.aal !== user.user_aal_level) {
    return redirect(routes.auth.verify2FA());
  }
  return (
    <div className="min-h-screen max-w-8xl mx-auto flex justify-between">
      <Sidebar />
      <div className="flex-1 max-w-[calc((664/16)*1rem)] mx-auto pt-7 px-8">
        <NavTabs />
        {props.children}
      </div>
      <SuggestionPanel />
    </div>
  );
}
