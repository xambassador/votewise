import Link from "next/link";
import { routes } from "@/lib/routes";

import { DotBackground } from "@votewise/ui/dot-background";

import { Banner } from "../../_components/banner";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden flex-1 flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">
          {() => (
            <Banner title="Create Account" subtitle="We're so excited to have you join us!">
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
