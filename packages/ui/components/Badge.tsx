import React from "react";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <div className="bg-gray-800 py-[2px] pl-[10px] pr-[4px] text-gray-400">{children}</div>;
}
