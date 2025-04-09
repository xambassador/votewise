import Link from "next/link";

import { DotBackground } from "@votewise/ui/dot-background";

import { Banner } from "@/app/(auth)/_components/banner";

import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden flex-1 flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">
          {() => (
            <Banner title="Forgot Password" subtitle="Enter your email and we will get back to you with a reset link.">
              <Link className="text-blue-400 w-fit" href={routes.auth.signIn()}>
                Log In Here!
              </Link>
            </Banner>
          )}
        </DotBackground>
      </div>
    </div>
  );
}
