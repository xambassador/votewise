import { cn } from "../cn";

export type NotificationProps = React.HTMLAttributes<HTMLDivElement>;

export function Notification(props: NotificationProps) {
  return (
    <div
      {...props}
      className={cn(
        "p-5 border border-nobelBlack-200 bg-nobelBlack-100 rounded-xl flex items-start gap-5",
        props.className
      )}
    />
  );
}

export type NotificationHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function NotificationHeader(props: NotificationHeaderProps) {
  return (
    <div {...props} className={cn("flex md:flex-row flex-col md:items-center justify-between", props.className)} />
  );
}

export type NotificationActorProps = React.HTMLAttributes<HTMLSpanElement>;

export function NotificationActor(props: NotificationActorProps) {
  return <span {...props} className={cn("font-semibold", props.className)} />;
}

export type NotificationResourceProps = React.HTMLAttributes<HTMLSpanElement>;

export function NotificationResource(props: NotificationResourceProps) {
  return <span {...props} className={cn("font-semibold text-blue-300", props.className)} />;
}

export type NotificationMessageProps = React.HTMLAttributes<HTMLParagraphElement>;

export function NotificationMessage(props: NotificationMessageProps) {
  return <p {...props} className={cn("text-base text-gray-200 flex-1", props.className)} />;
}

export type NotificationTimeagoProps = React.HTMLAttributes<HTMLSpanElement>;

export function NotificationTimeago(props: NotificationTimeagoProps) {
  return <span {...props} className={cn("text-xs text-gray-400 mt-1 md:mt-0", props.className)} />;
}

export type NotificationContentProps = React.HTMLAttributes<HTMLDivElement>;

export function NotificationContent(props: NotificationContentProps) {
  return <div {...props} className={cn("flex flex-col gap-3 w-full", props.className)} />;
}

export type NotificationFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function NotificationFooter(props: NotificationFooterProps) {
  return <div {...props} className={cn("flex items-center gap-3", props.className)} />;
}

export type NotificationResourcePreviewProps = React.HTMLAttributes<HTMLDivElement>;

export function NotificationResourcePreview(props: NotificationResourcePreviewProps) {
  return <div {...props} className={cn("p-3 border-l-2 border-nobelBlack-200", props.className)} />;
}

export type NotificationResourcePreviewTextProps = React.HTMLAttributes<HTMLParagraphElement>;

export function NotificationResourcePreviewText(props: NotificationResourcePreviewTextProps) {
  return <div {...props} className={cn("text-gray-400 italic text-sm", props.className)} />;
}
