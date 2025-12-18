import Image from "next/image";

import { cn } from "@/lib/cn";

import logo from "@/assets/images/logo.png";

import { MobileSidebar } from "./sidebar";

export function Logo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("pb-2 border-b border-nobelBlack-200 flex items-center justify-end", props.className)}
    >
      <Image src={logo} alt="Votewise" />
    </div>
  );
}

export function MobileLogo(props: React.HTMLAttributes<HTMLDivElement> & { avatarUrl: string; name: string }) {
  const { avatarUrl, name, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "xl:hidden tab-container-height bg-nobelBlack-50 flex items-center sticky top-0 w-full px-8 pt-7 z-10",
        rest.className
      )}
    >
      <MobileSidebar avatarUrl={avatarUrl} name={name} />
      <div className="flex items-center justify-center flex-1 mb-2">
        <Image src={logo} alt="Votewise" />
      </div>
    </div>
  );
}
