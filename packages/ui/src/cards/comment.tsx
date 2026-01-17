"use client";

import { forwardRef, memo, useState } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../cn";
import { createContext } from "../context";
import { Comment as CommentIcon } from "../icons/comment";
import { Cross } from "../icons/cross";
import { Minus } from "../icons/minus";
import { PaperPlane } from "../icons/paper-plane";
import { Pencil } from "../icons/pencil";
import { Plus } from "../icons/plus";
import { Trash } from "../icons/trash";
import { InputField } from "../input-field";
import { Spinner } from "../ring-spinner";
import { Textarea } from "../textarea-autosize";

type CommentState = {
  isReplyOpen?: boolean;
  isEditMode?: boolean;
  toggle?: (editMode?: boolean) => void;
};
const [CommentProvider, useComment] = createContext<CommentState>("Comment");
CommentProvider.displayName = "CommentProvider";
export { useComment };

type CommentsRef = HTMLDivElement;
export type CommentsProps = React.HTMLAttributes<HTMLDivElement>;
export const Comments = forwardRef<CommentsRef, CommentsProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex flex-col gap-5 relative", props.className)} />
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
    const [isEditMode, setIsEditMode] = useState(false);

    const toggle = (editMode = false) => {
      if (!editMode) {
        setIsReplyOpen((prev) => !prev);
        return;
      }
      setIsEditMode((prev) => !prev);
      setIsReplyOpen(false);
    };

    return (
      <CommentProvider isReplyOpen={isReplyOpen} toggle={toggle} isEditMode={isEditMode}>
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
  <div {...props} ref={ref} className={cn("flex items-center gap-x-2 flex-wrap", props.className)} />
));
CommentHeader.displayName = "CommentHeader";

export type CommentAuthorProps = React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean };
export const CommentAuthor = forwardRef<HTMLSpanElement, CommentAuthorProps>((props, ref) => {
  const { asChild, className, ...rest } = props;
  const Component = asChild ? Slot : "span";
  return <Component {...rest} ref={ref} className={cn("text-base text-gray-200", className)} />;
});
CommentAuthor.displayName = "CommentAuthor";

export type CommentDateProps = React.HTMLAttributes<HTMLSpanElement>;
export const CommentDate = forwardRef<HTMLSpanElement, CommentDateProps>((props, ref) => (
  <span {...props} ref={ref} className={cn("text-base text-gray-400", props.className)} />
));
CommentDate.displayName = "CommentDate";

export type CommentUpdatedLabelProps = React.HTMLAttributes<HTMLSpanElement>;
export const CommentUpdatedLabel = forwardRef<HTMLSpanElement, CommentUpdatedLabelProps>((props, ref) => (
  <span {...props} ref={ref} className={cn("text-sm text-gray-400", props.className)} />
));
CommentUpdatedLabel.displayName = "CommentUpdatedLabel";

export type CommentTextProps = React.HTMLAttributes<HTMLParagraphElement>;
export const CommentText = forwardRef<HTMLParagraphElement, CommentTextProps>((props, ref) => {
  const { isEditMode } = useComment("CommentText");
  if (isEditMode) return null;
  return <p {...props} ref={ref} className={cn("text-base text-gray-300", props.className)} />;
});
CommentText.displayName = "CommentText";

export type CommentActionsProps = React.HTMLAttributes<HTMLDivElement>;
export const CommentActions = forwardRef<HTMLDivElement, CommentActionsProps>((props, ref) => (
  <div {...props} ref={ref} className={cn("flex items-center gap-3 mt-3", props.className)} />
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
        "flex items-center justify-center gap-1 text-gray-400 text-sm focus-primary focus-presets rounded disabled:cursor-not-allowed",
        className
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        toggle?.();
      }}
    >
      {leftSlot || <CommentIcon className="text-gray-400 size-5" />}
      {children || "Reply"}
      {rightSlot}
    </button>
  );
});
CommentReplyButton.displayName = "CommentReplyButton";

export type CommentEditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};
export const CommentEditButton = forwardRef<HTMLButtonElement, CommentEditButtonProps>((props, ref) => {
  const { className, children, leftSlot, rightSlot, ...rest } = props;
  const { toggle, isEditMode } = useComment("CommentEditButton");
  const icon = isEditMode ? <Cross className="text-gray-400 size-5" /> : <Pencil className="text-gray-400 size-6" />;
  const label = isEditMode ? "Cancel" : "Edit";
  return (
    <button
      {...rest}
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-1 text-gray-400 text-sm focus-primary focus-presets rounded disabled:cursor-not-allowed",
        className
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        toggle?.(true);
      }}
    >
      {leftSlot || icon}
      {children || <span className="hidden sm:inline-block">{label}</span>}
      {rightSlot}
    </button>
  );
});
CommentEditButton.displayName = "CommentEditButton";

export type ReplyContainerProps = React.HTMLAttributes<HTMLDivElement>;
export const ReplyContainer = forwardRef<HTMLDivElement, ReplyContainerProps>((props, ref) => {
  const { className, ...rest } = props;
  return <div ref={ref} {...rest} className={cn("relative mt-5 flex flex-col gap-5", className)} />;
});
ReplyContainer.displayName = "ReplyContainer";

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

export const CommentEditInput = forwardRef<CommentInputRef, CommentInputProps>((props, ref) => {
  const { isEditMode } = useComment("CommentEditInput");
  if (!isEditMode) return null;
  return (
    <CommentInput
      {...props}
      ref={ref}
      inputFieldProps={{ ...props.inputFieldProps, className: cn("mt-1 py-1", props.inputFieldProps?.className) }}
    />
  );
});
CommentEditInput.displayName = "CommentEditInput";

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
    />
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

export function CommentMoreButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const { className, children, loading, disabled, ...rest } = props;
  const child = loading ? <Spinner className="size-4" /> : children || "More";
  const isDisabled = disabled || loading;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={cn(
        "text-gray-400 hover:text-gray-300 focus-primary focus-presets rounded p-1 underline flex items-center justify-center",
        className
      )}
    >
      {child}
    </button>
  );
}

export type CommentDeleteButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};
export const CommentDeleteButton = forwardRef<HTMLButtonElement, CommentDeleteButtonProps>((props, ref) => {
  const { className, children, leftSlot, rightSlot, ...rest } = props;
  return (
    <button
      {...rest}
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-1 text-gray-400 text-sm focus-primary focus-presets rounded disabled:cursor-not-allowed",
        className
      )}
    >
      {leftSlot || <Trash className="text-gray-400 size-5" />}
      {children}
      {rightSlot}
    </button>
  );
});
CommentDeleteButton.displayName = "CommentDeleteButton";

type ExpandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { expanded?: boolean };
export const ExpandButton = forwardRef<HTMLButtonElement, ExpandButtonProps>((props, ref) => {
  const { className, expanded, ...rest } = props;
  return (
    <button
      ref={ref}
      className={cn(
        "size-6 rounded-full border border-black-300 bg-nobelBlack-200 border-dashed flex items-center justify-center relative -left-3 top-4 focus-presets",
        className
      )}
      {...rest}
    >
      {expanded ? <Minus className="text-gray-400 size-4" /> : <Plus className="text-gray-400 size-4" />}
    </button>
  );
});
ExpandButton.displayName = "ExpandButton";
