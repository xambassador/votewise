import React from "react";
import type { ReactNode } from "react";

export function AuthScreenLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen w-screen bg-gray-50 text-white">
      <div className="flex h-full">{children}</div>
    </main>
  );
}
