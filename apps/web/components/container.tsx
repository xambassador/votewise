import { cn } from "@/lib/cn";

export function Container(props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  const { children, ...rest } = props;
  return (
    <div {...rest} className={cn("container-max-width mx-auto px-8", props.className)}>
      {children}
    </div>
  );
}
