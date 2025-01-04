import { cn } from "./cn";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function FloatingCounter(props: Props) {
  const { className, children, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "absolute text-xs font-medium text-black-200 size-10 rounded-full bg-nobelBlack-100 border border-nobelBlack-200 flex items-center justify-center",
        "shadow-[0_4px_10px_0_rgba(0,0,0,40%)]",
        className
      )}
    >
      {children}+
    </div>
  );
}
