import dynamic from "next/dynamic";

import { Authorized } from "@/components/auth";
import { FlashProvider } from "@/components/flash-provider";
import { Sidebar } from "@/components/sidebar";
import { SuggestionPanel } from "@/components/suggestion-panel";

const CreatePostMobile = dynamic(() => import("@/components/dialogs/create-post").then((m) => m.CreatePostMobile), {
  ssr: false
});
const MobileLogo = dynamic(() => import("@/components/logo").then((m) => m.MobileLogo), { ssr: false });

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <Authorized>
      {({ user }) => (
        <div className="min-h-screen lg:max-w-3xl xl:max-w-6xl 2xl:max-w-8xl mx-auto flex justify-between">
          <Sidebar name={user.first_name + " " + user.last_name} avatarUrl={user.avatar_url} />
          <main className="flex-1 w-full">
            <MobileLogo name={user.first_name + " " + user.last_name} avatarUrl={user.avatar_url} />
            <FlashProvider>{props.children}</FlashProvider>
            <CreatePostMobile />
          </main>
          <SuggestionPanel />
        </div>
      )}
    </Authorized>
  );
}
