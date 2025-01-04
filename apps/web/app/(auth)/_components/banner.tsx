import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle: string;
};

export function Banner(props: Props) {
  const { title, subtitle, children, ...rest } = props;
  return (
    <div {...rest} className={cn("flex flex-col gap-5 ml-12 relative max-w-fit", rest.className)}>
      <h1 className="text-7xl leading-11 text-black-100">{title}</h1>
      <p className="text-lg leading-7 font-light">{subtitle}</p>
      {children}
    </div>
  );
}
