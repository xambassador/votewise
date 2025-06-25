"use client";

import { forwardRef, memo, useState } from "react";

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

type CommentsRef = HTMLDivElement;
export type CommentsProps = React.HTMLAttributes<HTMLDivElement>;
export const Comments = forwardRef<CommentsRef, CommentsProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex flex-col gap-5", props.className)} />
));
Comments.displayName = "Comments";

export type CommentInputProps = React.ComponentProps<typeof Textarea> & {
  inputFieldProps?: React.ComponentProps<typeof InputField>;
  buttonProps?: React.ComponentProps<"button">;
};
type CommentInputRef = HTMLTextAreaElement;
export const CommentInput = forwardRef<CommentInputRef, CommentInputProps>((props, ref) => {
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
        ref={ref}
        {...textareaProps}
      />
      <button
        aria-label="Send comment"
        title="Send comment"
        {...buttonProps}
        className={cn("focus-primary focus-presets rounded", buttonProps?.className)}
      >
        {buttonProps?.children ?? <PaperPlane className="text-gray-500" />}
      </button>
    </InputField>
  );
});
CommentInput.displayName = "CommentInput";

type CommentListRef = HTMLDivElement;
export type CommentListProps = React.HTMLAttributes<HTMLDivElement>;
export const CommentList = forwardRef<CommentListRef, CommentListProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex flex-col gap-5", props.className)} />
));
CommentList.displayName = "CommentList";

type CommentRef = HTMLDivElement;
export type CommentProps = React.HTMLAttributes<HTMLDivElement>;
export const Comment = memo(
  forwardRef<CommentRef, CommentProps>((props, ref) => {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const toggle = () => {
      setIsReplyOpen((prev) => !prev);
    };

    return (
      <CommentProvider isReplyOpen={isReplyOpen} toggle={toggle}>
        <div {...props} ref={ref} className={cn("flex gap-3 relative", props.className)} />
      </CommentProvider>
    );
  })
);

export const CommentContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex flex-col gap-1 w-full", props.className)} />
));
CommentContent.displayName = "CommentContent";

export type CommentHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const CommentHeader = forwardRef<HTMLDivElement, CommentHeaderProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex items-center gap-2", props.className)} />
));
CommentHeader.displayName = "CommentHeader";

export type CommentAuthorProps = React.HTMLAttributes<HTMLSpanElement>;
export const CommentAuthor = forwardRef<HTMLSpanElement, CommentAuthorProps>((props, ref) => (
  <span {...props} ref={ref} className={cn("text-sm text-gray-200", props.className)} />
));
CommentAuthor.displayName = "CommentAuthor";

export type CommentDateProps = React.HTMLAttributes<HTMLSpanElement>;
export const CommentDate = forwardRef<HTMLSpanElement, CommentDateProps>((props, ref) => (
  <span {...props} ref={ref} className={cn("text-xs text-gray-400", props.className)} />
));
CommentDate.displayName = "CommentDate";

export type CommentTextProps = React.HTMLAttributes<HTMLParagraphElement>;
export const CommentText = forwardRef<HTMLParagraphElement, CommentTextProps>((props, ref) => (
  <p {...props} ref={ref} className={cn("text-base text-gray-300", props.className)} />
));
CommentText.displayName = "CommentText";

export type CommentActionsProps = React.HTMLAttributes<HTMLDivElement>;
export const CommentActions = forwardRef<HTMLDivElement, CommentActionsProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex items-center gap-3 mt-4", props.className)} />
));
CommentActions.displayName = "CommentActions";

export type CommentReplyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};
export const CommentReplyButton = forwardRef<HTMLButtonElement, CommentReplyButtonProps>((props, ref) => {
  const { className, children, leftSlot, rightSlot, ...rest } = props;
  const { toggle } = useComment("CommentReplyButton");
  return (
    <button
      {...rest}
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-1 text-gray-400 text-sm focus-primary focus-presets rounded",
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
});
CommentReplyButton.displayName = "CommentReplyButton";

export const CommentReplyInput = forwardRef<CommentInputRef, CommentInputProps>((props, ref) => {
  const { isReplyOpen } = useComment("CommentReplyInput");
  if (!isReplyOpen) return null;
  return (
    <CommentInput
      {...props}
      ref={ref}
      inputFieldProps={{ ...props.inputFieldProps, className: cn("mt-1", props.inputFieldProps?.className) }}
    />
  );
});
CommentReplyInput.displayName = "CommentReplyInput";

export type CommentConnectorLineProps = React.HTMLAttributes<HTMLDivElement> & {
  hasReplies?: boolean;
};
export const CommentConnectorLine = forwardRef<HTMLDivElement, CommentConnectorLineProps>((props, ref) => {
  const { hasReplies = false, ...rest } = props;
  if (!hasReplies) return null;
  return (
    <div
      {...rest}
      ref={ref}
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
});
CommentConnectorLine.displayName = "CommentConnectorLine";

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
