import { cn } from "@/lib/cn";

export function OnboardContainer(props: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("max-w-[calc((500/16)*1rem)] min-w-[calc((500/16)*1rem)] flex flex-col gap-10", props.className)}
    />
  );
}
