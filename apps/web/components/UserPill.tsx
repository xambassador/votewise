import React from "react";

import classNames from "@votewise/lib/classnames";
import { Avatar } from "@votewise/ui";

type Props = {
  className?: string;
  src: string;
  username: string;
  width?: number;
  height?: number;
} & {
  avatarProps?: React.ComponentProps<typeof Avatar>;
} & {
  usernameProps?: React.ComponentProps<"span">;
};

export function UserPill(props: Props) {
  const { className, src, username, width = 48, height = 48, avatarProps, usernameProps } = props;
  const { className: usernameClassName } = usernameProps ?? {};
  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <Avatar src={src} alt="Avatar" width={width} height={height} rounded {...avatarProps} />
      <span className={classNames("text-black-900 font-medium", usernameClassName)} {...usernameProps}>
        {username}
      </span>
    </div>
  );
}
