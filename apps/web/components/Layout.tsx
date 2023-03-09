import React from "react";
import type { ReactNode } from "react";

import { Navbar } from "./Navbar";
import { LeftPanel } from "./panels/LeftPanel";
import { RightPanel, UserInfo, UserRecommendations } from "./panels/RightPanel";

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen min-w-full">
      <Navbar />
      <main className="mt-14">
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
