import { cn } from "@/lib/cn";

export function Search(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("p-5 rounded-xl border border-nobelBlack-200 bg-nobelBlack-100", props.className)} />
  );
}

export function SearchContentBox(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-2", props.className)} />;
}

export function SearchHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex gap-3", props.className)} />;
}
