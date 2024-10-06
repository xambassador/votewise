import { cn } from "@/lib/cn";

export function OnboardTitle(props: React.ComponentProps<"h1">) {
  return <h1 {...props} className={cn("text-3xl font-medium text-gray-300", props.className)} />;
}

export function OnboardSubtitle(props: React.ComponentProps<"span">) {
  return <span {...props} className={cn("text-xl text-gray-300", props.className)} />;
}

export function OnboardHeader(props: React.ComponentProps<"header">) {
  return <header {...props} className={cn("flex flex-col gap-2", props.className)} />;
}
