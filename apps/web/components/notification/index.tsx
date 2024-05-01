import type { ReactNode } from "react";

import React from "react";
import SimpleBar from "simplebar-react";

import classNames from "@votewise/lib/classnames";
import { Avatar, Button } from "@votewise/ui";

type NotificationContainerProps = {
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function NotificationContainer(props: NotificationContainerProps) {
  const { children, className, ...rest } = props;
  return (
    <div
      className={classNames(
        "shadow-notification-container max-h-[32rem] max-w-[calc((420/16)*1rem)] overflow-hidden rounded-lg border border-gray-200 bg-white",
        className
      )}
      {...rest}
    >
      <SimpleBar style={{ maxHeight: "32rem" }}>
        <div className="flex flex-col p-5">{children}</div>
      </SimpleBar>
    </div>
  );
}

type NotificationActionPanelProps = {
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function NotificationActionPanel(props: NotificationActionPanelProps) {
  const { children, className, ...rest } = props;
  return (
    <div className={classNames("flex items-center justify-between pb-5", className)} {...rest}>
      <h1 className="text-xl font-semibold text-gray-600">Notifications</h1>
      <button type="button" className="text-base font-medium text-blue-700">
        Delete all
      </button>
      {children}
    </div>
  );
}

export function NotificationTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={classNames("max-w-[calc((230/16)*1rem)] text-sm text-gray-600", className)}>
      {children}
    </span>
  );
}

export function NotificationTimeAgo({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={classNames("text-sm text-gray-600", className)}>{children}</span>;
}

export function NotificationHeader({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-center justify-between">{children}</div>;
}

function NotificationDivider() {
  return <div className="w-full rounded-full border border-gray-200" />;
}

export function NotificationBody({ children }: { children: ReactNode }) {
  return <div className="flex gap-3">{children}</div>;
}

export function NotificationAvatar({ src }: { src: string }) {
  return <Avatar className="h-10 w-10 flex-[0_0_2.5rem]" src={src} rounded width={40} height={40} />;
}

export function NotificationContentWrapper({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-2">{children}</div>;
}

export function NotificationActionButtonsPanel({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex items-center gap-4">{children}</div>;
}

export function NotificationContent({
  children,
  className,
  action,
}: {
  children?: ReactNode;
  className?: string;
  action?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {action && (
        <div
          className={classNames("flex gap-[10px] border-l-2 border-blue-600 py-[6px] px-[10px]", className)}
        >
          <p className="text-sm font-semibold text-gray-600">{action}</p>
        </div>
      )}
      {children && <p className="text-sm font-medium text-gray-600">{children}</p>}
    </div>
  );
}

export function Notification({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {children}
      <NotificationDivider />
    </div>
  );
}

export function NotificationPrimaryButton({ children }: { children: ReactNode }) {
  return <Button className="w-fit rounded py-2 px-3">{children}</Button>;
}

export function NotificationSecondaryButton({ children }: { children: ReactNode }) {
  return (
    <Button className="w-fit rounded bg-white py-2 px-3" secondary>
      {children}
    </Button>
  );
}
