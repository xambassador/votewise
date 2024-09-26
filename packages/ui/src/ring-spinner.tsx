import { cn } from "./cn";

type Props = React.SVGProps<SVGSVGElement>;

export function Spinner(props: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      height="40"
      width="40"
      {...props}
      className={cn(
        "size-10 origin-center overflow-visible animate-rotate will-change-transform bg-transparent",
        props.className
      )}
    >
      <circle
        className="fill-none opacity-10 transition-[stroke] duration-500 ease"
        stroke="currentColor"
        cx="20"
        cy="20"
        r="17.5"
        pathLength="100"
        strokeWidth="5px"
        fill="none"
      />
      <circle
        className="fill-none transition-[stroke] duration-500 ease"
        stroke="currentColor"
        strokeDasharray="25, 75"
        strokeDashoffset="0"
        strokeLinecap="round"
        cx="20"
        cy="20"
        r="17.5"
        pathLength="100"
        strokeWidth="5px"
        fill="none"
      />
    </svg>
  );
}
