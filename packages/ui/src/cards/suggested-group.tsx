"use client";

import { cn } from "../cn";
import { createContext } from "../context";
import { Plus } from "../icons/plus";

const [Provider, useProvider] = createContext("SuggestedGroupCard");

export function SuggestedGroupCard(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  return (
    <Provider>
      <div {...rest} className={cn("flex flex-col gap-2", className)}>
        {children}
      </div>
    </Provider>
  );
}

export function Header(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  useProvider("Header");
  return (
    <div {...rest} className={cn("flex w-full", className)}>
      {children}
    </div>
  );
}

export function GroupName(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className, children, ...rest } = props;
  useProvider("GroupName");
  return (
    <span {...rest} className={cn("text-sm font-medium text-gray-300", className)}>
      {children}
    </span>
  );
}

export function GroupCreatorHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className, children, ...rest } = props;
  useProvider("GroupCreatorHandle");
  return (
    <span {...rest} className={cn("text-xs text-gray-400", className)}>
      Group by <b>{children}</b>
    </span>
  );
}

export function GroupDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const { className, children, ...rest } = props;
  useProvider("GroupDescription");
  return (
    <p {...rest} className={cn("text-gray-300 text-xs")}>
      {children}
    </p>
  );
}

export function GroupJoinButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  const { children, ...rest } = props;
  useProvider("GroupJoinButton");
  return <button {...rest}>{children || <Plus className="text-gray-400" />}</button>;
}
