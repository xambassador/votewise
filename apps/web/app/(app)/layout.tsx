import { Sidebar } from "@/components/sidebar";
import { SuggestionPanel } from "@/components/suggestion-panel";
import { UserProvider } from "@/components/user-provider";

import { AuthenticatedLayout } from "./_components/utils";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <AuthenticatedLayout>
      {({ user }) => (
        <UserProvider user={user}>
          <div className="min-h-screen max-w-8xl mx-auto flex justify-between">
            <Sidebar name={user.first_name + " " + user.last_name} avatarUrl={user.avatar_url} />
            <main className="flex-1">{props.children}</main>
            <SuggestionPanel />
          </div>
        </UserProvider>
      )}
    </AuthenticatedLayout>
  );
}
