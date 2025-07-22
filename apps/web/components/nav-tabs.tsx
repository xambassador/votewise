"use client";

import { cn } from "@/lib/cn";

type Props = { children: React.ReactNode };

const tabsWrapperClass = "flex items-center gap-4 border-b border-nobelBlack-200 tab-wrapper-width mx-auto";
const activeButtonClass = "h-7 text-blue-200 text-sm font-medium border-b border-blue-600 focus-visible";
const inActiveButtonClass = "h-7 text-black-200 text-sm font-medium focus-visible";

export function NavTabs(props: Props) {
  const { children } = props;
  return (
    <div className="tab-container">
      <div className={tabsWrapperClass}>{children}</div>
    </div>
  );
}

type NabTabButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean };
export function NavTabButton(props: NabTabButtonProps) {
  const { isActive, children, className, ...rest } = props;
  const buttonClass = isActive ? activeButtonClass : inActiveButtonClass;
  return (
    <button {...rest} className={cn(buttonClass, className)}>
      {children}
    </button>
  );
}
