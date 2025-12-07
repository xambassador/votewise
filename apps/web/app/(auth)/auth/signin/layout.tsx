import Link from "next/link";

import { DotBackground } from "@votewise/ui/dot-background";

import { FlashProvider } from "@/components/flash-provider";

import { Banner } from "@/app/(auth)/_components/banner";

import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <FlashProvider>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 min-h-screen flex flex-col items-center lg:items-end px-6 sm:px-12 lg:px-0 lg:mr-20 justify-center">
          <Banner title="Sign in" subtitle="" className="ml-0 lg:hidden w-full max-w-md mb-10" />
          {props.children}
          <Link className="lg:hidden text-blue-400 w-fit focus-presets text-sm mt-5" href={routes.auth.signUp()}>
            No Account? No Problem!
          </Link>
        </div>
        <div className="hidden lg:flex w-full relative overflow-hidden flex-1 flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
          <DotBackground className="flex flex-col justify-center">
            {() => (
              <Banner title="Sign in" subtitle="Enter your username and password">
                <Link className="text-blue-400 w-fit focus-presets" href={routes.auth.signUp()}>
                  No Account? No Problem!
                </Link>
              </Banner>
            )}
          </DotBackground>
        </div>
      </div>
    </FlashProvider>
  );
}
