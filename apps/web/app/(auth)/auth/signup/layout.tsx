import Link from "next/link";

import { DotBackground } from "@votewise/ui/dot-background";

import { Banner } from "@/app/(auth)/_components/banner";

import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-center lg:items-end px-6 sm:px-12 lg:px-0 lg:mr-20 justify-center">
        <Banner
          title="Create Account"
          subtitle=""
          className="ml-0 lg:hidden w-full max-w-full sm:min-w-[calc((450/16)*1rem)] sm:max-w-[calc((450/16)*1rem)] mb-10"
        />
        {props.children}
        <Link className="lg:hidden text-blue-400 w-fit focus-presets text-sm mt-5" href={routes.auth.signIn()}>
          Log In Here!
        </Link>
      </div>
      <div className="hidden w-full relative overflow-hidden flex-1 lg:flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">
          {() => (
            <Banner title="Create Account" subtitle="We're so excited to have you join us!">
              <Link className="text-blue-400 w-fit focus-presets focus-presets text-base" href={routes.auth.signIn()}>
                Log In Here!
              </Link>
            </Banner>
          )}
        </DotBackground>
      </div>
    </div>
  );
}
