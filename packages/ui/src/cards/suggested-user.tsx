"use client";

import { cn } from "../cn";
import { createContext } from "../context";
import { UserPlus } from "../icons/user-plus";

type State = { userId: string };
const [Provider, useProvider] = createContext<State>("RecommendedUserCard");

export function RecommendedUserCard(props: React.HTMLAttributes<HTMLDivElement> & { userId: string }) {
  const { className, children, userId, ...rest } = props;
  return (
    <Provider userId={userId}>
      <div {...rest} className={cn("flex items-center gap-1 w-full", className)}>
        {children}
      </div>
    </Provider>
  );
}

export function RecommendedUserCardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  useProvider("RecommendedUserCardHeader");
  return (
    <div {...rest} className={cn("flex gap-1 flex-wrap", className)}>
      {children}
    </div>
  );
}

export function UserName(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className, children, ...rest } = props;
  useProvider("UserName");
  return (
    <span {...rest} className={cn("text-xs text-gray-300", className)}>
      {children}
    </span>
  );
}

export function UserHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  const { className, children, ...rest } = props;
  useProvider("UserHandle");
  return (
    <span {...rest} className={cn("text-gray-400 text-xs", className)}>
      {children}
    </span>
  );
}

export function UserBio(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const { className, children, ...rest } = props;
  useProvider("UserBio");
  return (
    <p {...rest} className={cn("text-xs text-gray-300", className)}>
      {children}
    </p>
  );
}

export function UserFollowButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  const { children, onClick, ...rest } = props;
  useProvider("UserFollowButton");
  return <button {...rest}>{children || <UserPlus className="text-gray-400" />}</button>;
}
