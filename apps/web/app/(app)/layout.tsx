import { Authorized } from "@/components/auth";
import { Container } from "@/components/container";
import { FlashProvider } from "@/components/flash-provider";
import { NavTabs } from "@/components/nav-tabs";
import { Sidebar } from "@/components/sidebar";
import { SuggestionPanel } from "@/components/suggestion-panel";

type Props = { children: React.ReactNode };

export default async function Layout(props: Props) {
  return (
    <Authorized>
      {({ user }) => (
        <div className="min-h-screen max-w-8xl mx-auto flex justify-between">
          <Sidebar name={user.first_name + " " + user.last_name} avatarUrl={user.avatar_url} />
          <main className="flex-1">
            <FlashProvider>
              <NavTabs />
              <Container>{props.children}</Container>
            </FlashProvider>
          </main>
          <SuggestionPanel />
        </div>
      )}
    </Authorized>
  );
}
