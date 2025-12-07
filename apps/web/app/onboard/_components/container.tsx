import { cn } from "@/lib/cn";

export function OnboardContainer(props: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "sm:max-w-[calc((500/16)*1rem)] w-full sm:min-w-[calc((500/16)*1rem)] flex flex-col gap-10 px-6 sm:px-0",
        props.className
      )}
    />
  );
}
