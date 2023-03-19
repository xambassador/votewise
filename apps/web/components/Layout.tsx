import React from "react";
import type { ReactNode } from "react";

import { Navbar } from "./Navbar";
import { UserInfo } from "./UserInfo";
import { LeftPanel } from "./panels/LeftPanel";
import { RightPanel, UserRecommendations } from "./panels/RightPanel";

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen min-w-full">
      <Navbar />
      <main className="mt-[calc((150/16)*1rem)]">
        <div className="container mx-auto flex justify-between pb-6">
          <LeftPanel />
          {children}
          <RightPanel>
            <UserInfo />
            <UserRecommendations />
          </RightPanel>
        </div>
      </main>
    </div>
  );
}
