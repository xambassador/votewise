"use client";

import type { VariantProps } from "class-variance-authority";

import { useState } from "react";
import { cva } from "class-variance-authority";

import { cn } from "./cn";
import { createContext } from "./context";

type State = {
  count: number;
  setCount: (count: number) => void;
};

const [Provider, useVoteButton] = createContext<State>("VoteProvider");

export type VoteProviderProps = React.HTMLAttributes<HTMLDivElement> & { count?: number };
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

const voteCountVariants = cva("text-sm text-blue-100", {
  variants: {
    variant: {
      default: "size-8 rounded-lg bg-nobelBlack-100 border border-nobelBlack-200 flex items-center justify-center",
      minimal: ""
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface VoteCountProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof voteCountVariants> {}

export function VoteCount(props: VoteCountProps) {
  const { variant, className, ...rest } = props;
  const { count } = useVoteButton("VoteCount");
  return (
    <div {...rest} className={cn(voteCountVariants({ className, variant }))}>
      {count}
    </div>
  );
}

const voted = <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B1D766] to-[#F15DD6]">Voted</span>;

export function VoteButton(props: VoteButtonProps) {
  const { setCount, count } = useVoteButton("VoteButton");
  const { children, className, isVoted: _isVoted = false, onClick, ...rest } = props;
  const [isVoted, setIsVoted] = useState(_isVoted);

  if (isVoted) {
    return (
      <button className="px-5 bg-nobelBlack-100 text-sm h-12 max-w-20 w-full font-medium flex items-center justify-center">
        {voted}
      </button>
    );
  }

  return (
    <button
      {...rest}
      onClick={(e) => {
        setCount(count + 1);
        setIsVoted(true);
        onClick?.(e);
      }}
      className={
        // Don't know why, but cn is not working on shadow classes and it is removing them from the output list
        "flex items-center justify-center shadow-vote-button shadow-nobelBlack-200 hover:shadow-vote-button-hover hover:shadow-nobelBlack-200 hover:translate-y-[-2px] active:shadow-vote-button-active active:shadow-nobelBlack-200 active:translate-y-[2px] " +
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
