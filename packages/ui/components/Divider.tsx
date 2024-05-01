import type { ReactNode } from "react";

import React from "react";

type DividerProps = {
  children?: ReactNode;
};

export function Divider(props: DividerProps) {
  const { children } = props;
  if (!children) {
    return (
      <div className="flex items-center">
        <span className="flex-1 border border-gray-200" />
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <span className="flex-1 border border-gray-200" />
      <span className="px-1">{children}</span>
      <span className="flex-1 border border-gray-200" />
    </div>
  );
}
