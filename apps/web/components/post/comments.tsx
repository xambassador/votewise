import type { ReactNode } from "react";
import React from "react";

import { classNames } from "@votewise/lib";
import { FiMessageCircle as Message, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import { ButtonGroup } from ".";

export function CommentsWrapper({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={classNames("flex flex-col gap-5", className)}>{children}</div>;
}

type CommentProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function Comment(props: CommentProps) {
  return <div {...props} />;
}

type CommentHeaderProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function CommentHeader(props: CommentHeaderProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("flex items-center gap-3", className)} {...rest}>
      {children}
    </div>
  );
}

type CommentBodyProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function CommentBody(props: CommentBodyProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("mt-2 flex w-full", className)} {...rest}>
      {children}
    </div>
  );
}

type CommentSeparatorProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function CommentSeparator(props: CommentSeparatorProps) {
  const { className, ...rest } = props;
  return (
    <div className={classNames("flex flex-[0_0_calc((48/16)*1rem)] justify-center", className)} {...rest}>
      <div className="border border-gray-100" />
    </div>
  );
}

type CommentTextProps = React.HtmlHTMLAttributes<HTMLParagraphElement>;
export function CommentText(props: CommentTextProps) {
  const { className, children, ...rest } = props;
  return (
    <p className={classNames("text-gray-800", className)} {...rest}>
      {children}
    </p>
  );
}

type CommentActionsProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  upvoteButtonProps?: React.HTMLAttributes<HTMLButtonElement>;
  replyButtonProps?: React.HTMLAttributes<HTMLButtonElement>;
  upvoteIconProps?: React.ComponentProps<typeof Upvote>;
  replyIconProps?: React.ComponentProps<typeof Message>;
  upvoteTextProps?: React.HTMLAttributes<HTMLSpanElement>;
  replyTextProps?: React.HTMLAttributes<HTMLSpanElement>;
};
export function CommentActions(props: CommentActionsProps) {
  const {
    className,
    upvoteButtonProps,
    replyButtonProps,
    upvoteIconProps,
    replyIconProps,
    upvoteTextProps,
    replyTextProps,
    ...passThrogh
  } = props;
  return (
    <div className={classNames("flex items-center gap-5", className)} {...passThrogh}>
      <ButtonGroup>
        <button type="button" {...upvoteButtonProps}>
          <Upvote className="h-5 w-5 text-gray-500" {...upvoteIconProps} />
        </button>
        <span
          className={classNames("text-sm text-gray-600", upvoteTextProps?.className)}
          {...upvoteTextProps}
        >
          10
        </span>
      </ButtonGroup>

      <ButtonGroup>
        <button type="button" {...replyButtonProps}>
          <Message className="h-5 w-5 text-gray-500" {...replyIconProps} />
        </button>
        <span className={classNames("text-sm text-gray-600", replyTextProps?.className)} {...replyTextProps}>
          Reply
        </span>
      </ButtonGroup>
    </div>
  );
}
