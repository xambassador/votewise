"use client";

import { useState } from "react";

import { cn } from "./cn";
import { createContext } from "./context";

type State = {
  count: number;
  setCount: (count: number) => void;
};

const [Provider, useVoteButton] = createContext<State>("VoteProvider");

export type VoteProviderProps = React.HTMLAttributes<HTMLDivElement> & { count?: number };
export type VoteCountProps = React.HTMLAttributes<HTMLDivElement>;
export type VoteButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { isVoted?: boolean };

export function VoteProvider(props: VoteProviderProps) {
  const { count: defaultCount, children, ...rest } = props;
  const [count, setCount] = useState(defaultCount || 0);
  return (
    <Provider count={count} setCount={setCount}>
      <div
        {...rest}
        className={cn(
          "flex flex-col gap-3 items-center justify-center max-w-[calc((82/16)*1rem)] min-w-[calc((82/16)*1rem)]",
          rest.className
        )}
      >
        {children}
      </div>
    </Provider>
  );
}

export function VoteCount(props: VoteCountProps) {
  const { count } = useVoteButton("VoteCount");
  return (
    <div
      {...props}
      className={cn(
        "size-8 rounded-lg bg-nobelBlack-100 border border-nobelBlack-200 text-sm text-blue-100 flex items-center justify-center",
        props.className
      )}
    >
      {count}
    </div>
  );
}

const voted = <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B1D766] to-[#F15DD6]">Voted</span>;

export function VoteButton(props: VoteButtonProps) {
  const { setCount, count } = useVoteButton("VoteButton");
  const { children, className, isVoted: _isVoted = false, ...rest } = props;
  const [isVoted, setIsVoted] = useState(_isVoted);

  if (isVoted) {
    return <button className="px-5 bg-nobelBlack-100 text-sm h-12 max-w-20 w-full font-medium">{voted}</button>;
  }

  return (
    <button
      {...rest}
      onClick={() => {
        setCount(count + 1);
        setIsVoted(true);
      }}
      className={
        // Don't know why, but cn is not working on shadow classes and it is removing them from the output list
        "shadow-vote-button shadow-nobelBlack-200 hover:shadow-vote-button-hover hover:shadow-nobelBlack-200 hover:translate-y-[-2px] active:shadow-vote-button-active active:shadow-nobelBlack-200 active:translate-y-[2px] " +
        cn(
          "px-5 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200 text-sm text-gray-50 h-12 max-w-20 w-full transition-[shadow_transform]",
          className
        )
      }
    >
      {children}
    </button>
  );
}
