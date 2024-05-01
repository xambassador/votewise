import type { ReactNode } from "react";

import React from "react";
import { useRouter } from "next/router";

import { GlobalProvider } from "lib/context/global";

import { Navbar } from "./Navbar";
import { LeftPanel } from "./panels/LeftPanel";
import { RightPanel, UserRecommendations } from "./panels/RightPanel";
import { UserInfo } from "./UserInfo";

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  const router = useRouter();

  const { pathname } = router;

  const isGroupPath = pathname.startsWith("/groups");

  return (
    <GlobalProvider>
      <div className="min-h-screen min-w-full">
        <Navbar />
        <main className="mt-[calc((150/16)*1rem)]">
          <div className="container mx-auto flex justify-between pb-6">
            {!isGroupPath && <LeftPanel />}
            {children}
            {!isGroupPath && (
              <RightPanel>
                <UserInfo />
                <UserRecommendations />
              </RightPanel>
            )}
          </div>
        </main>
      </div>
    </GlobalProvider>
  );
}
