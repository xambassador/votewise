import React from "react";

import { classNames } from "@votewise/lib";
import { Avatar } from "@votewise/ui";

type Props = {
  className?: string;
  src: string;
  username: string;
  width?: number;
  height?: number;
};

export function UserPill(props: Props) {
  const { className, src, username, width = 48, height = 48 } = props;
  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <Avatar src={src} alt="Avatar" width={width} height={height} rounded />
      <span className="text-black-900 font-medium">{username}</span>
    </div>
  );
}
