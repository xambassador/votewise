"use client";

import { memo, useState } from "react";

import { cn } from "../cn";
import { createContext } from "../context";
import { Comment as CommentIcon } from "../icons/comment";
import { PaperPlane } from "../icons/paper-plane";
import { Plus } from "../icons/plus";
import { InputField } from "../input-field";
import { Textarea } from "../textarea-autosize";

type CommentState = {
  isReplyOpen?: boolean;
  toggle?: () => void;
};
const [CommentProvider, useComment] = createContext<CommentState>("Comment");
CommentProvider.displayName = "CommentProvider";

export type CommentsProps = React.HTMLAttributes<HTMLDivElement>;
export function Comments(props: CommentsProps) {
  return <div {...props} className={cn("flex flex-col gap-5", props.className)} />;
}

export type CommentInputProps = React.ComponentProps<typeof Textarea> & {
  inputFieldProps?: React.ComponentProps<typeof InputField>;
  buttonProps?: React.ComponentProps<"button">;
};
export function CommentInput(props: CommentInputProps) {
  const { inputFieldProps, buttonProps, ...textareaProps } = props;
  return (
    <InputField
      {...inputFieldProps}
      className={cn("h-auto min-h-10 bg-nobelBlack-50 w-full", inputFieldProps?.className)}
    >
      <Textarea
        placeholder="Add a comment"
        className="w-full scroller bg-inherit"
        name="comment"
        id="comment-input"
        maxRows={4}
        {...textareaProps}
      />
      <button
        aria-label="Send comment"
        title="Send comment"
        {...buttonProps}
        className={cn("focus:ring-1 focus:outline-none", buttonProps?.className)}
      >
        {buttonProps?.children ?? <PaperPlane className="text-gray-500" />}
      </button>
    </InputField>
  );
}

export type CommentListProps = React.HTMLAttributes<HTMLDivElement>;
export function CommentList(props: CommentListProps) {
  return <div {...props} className={cn("flex flex-col gap-5", props.className)} />;
}

export type CommentProps = React.HTMLAttributes<HTMLDivElement>;
export const Comment = memo(function Comment(props: CommentProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const toggle = () => {
    setIsReplyOpen((prev) => !prev);
  };

  return (
    <CommentProvider isReplyOpen={isReplyOpen} toggle={toggle}>
      <div {...props} className={cn("flex gap-3 relative", props.className)} />
    </CommentProvider>
  );
});

export function CommentContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-1", props.className)} />;
}

export type CommentHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export function CommentHeader(props: CommentHeaderProps) {
  return <div {...props} className={cn("flex items-center gap-2", props.className)} />;
}

export type CommentAuthorProps = React.HTMLAttributes<HTMLSpanElement>;
export function CommentAuthor(props: CommentAuthorProps) {
  return <span {...props} className={cn("text-sm text-gray-200", props.className)} />;
}

export type CommentDateProps = React.HTMLAttributes<HTMLSpanElement>;
export function CommentDate(props: CommentDateProps) {
  return <span {...props} className={cn("text-xs text-gray-400", props.className)} />;
}

export type CommentTextProps = React.HTMLAttributes<HTMLParagraphElement>;
export function CommentText(props: CommentTextProps) {
  return <p {...props} className={cn("text-base text-gray-300", props.className)} />;
}

export type CommentActionsProps = React.HTMLAttributes<HTMLDivElement>;
export function CommentActions(props: CommentActionsProps) {
  return <div {...props} className={cn("flex items-center gap-3 mt-4", props.className)} />;
}

export type CommentReplyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};
export function CommentReplyButton(props: CommentReplyButtonProps) {
  const { className, children, leftSlot, rightSlot, ...rest } = props;
  const { toggle } = useComment("CommentReplyButton");
  return (
    <button
      {...rest}
      className={cn(
        "flex items-center justify-center gap-1 text-gray-400 text-sm outline-none focus:ring-1",
        className
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        toggle?.();
      }}
    >
      {leftSlot || <CommentIcon className="text-gray-400" />}
      {children || "Reply"}
      {rightSlot}
    </button>
  );
}

export function CommentReplyInput(props: CommentInputProps) {
  const { isReplyOpen } = useComment("CommentReplyInput");
  if (!isReplyOpen) return null;
  return (
    <CommentInput
      {...props}
      inputFieldProps={{ ...props.inputFieldProps, className: cn("mt-1", props.inputFieldProps?.className) }}
    />
  );
}

export type CommentConnectorLineProps = React.HTMLAttributes<HTMLDivElement> & {
  hasReplies?: boolean;
};
export function CommentConnectorLine(props: CommentConnectorLineProps) {
  const { hasReplies = false, ...rest } = props;
  if (!hasReplies) return null;
  return (
    <div
      {...rest}
      className={cn(
        "bg-nobelBlack-200 absolute left-8 -translate-x-4 top-9 w-[2px] rounded-full h-[calc(100%-3rem)]",
        rest.className
      )}
    >
      <button className="size-6 rounded-full border border-black-300 bg-nobelBlack-200 border-dashed flex items-center justify-center relative -left-3 top-4">
        <Plus className="text-gray-400 size-4" />
      </button>
    </div>
  );
}

export type ReplyConnectorProps = React.SVGProps<SVGSVGElement>;
export function ReplyConnector(props: ReplyConnectorProps) {
  return (
    <svg
      width="22"
      height="52"
      viewBox="0 0 22 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("absolute -top-8 -left-7 text-nobelBlack-200", props.className)}
    >
      <path d="M21 50.853S1 53.205 1 39.095V1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
