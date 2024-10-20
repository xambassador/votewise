import { cn } from "./cn";

type Props = { children?: React.ReactNode | ((props: { className: string }) => React.ReactNode) } & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & { backdropProps?: React.HTMLAttributes<HTMLDivElement> };

const textTheme =
  "text-4xl sm:text-7xl font-medium relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-black-100 to-black-300 py-5";

export function DotBackground(props: Props) {
  const { children, backdropProps = {}, ...rest } = props;
  return (
    <div {...rest} className={cn("h-full w-full bg-transparent bg-dot-[#fff]/[0.1] relative", rest.className)}>
      <div
        {...backdropProps}
        className={cn(
          "absolute pointer-events-none inset-0 flex items-center justify-center bg-nobelBlack-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
          backdropProps.className
        )}
      />
      {typeof children !== "function" && <p className={textTheme}>{children}</p>}
      {typeof children === "function" && children({ className: textTheme })}
    </div>
  );
}
