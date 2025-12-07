import { DotBackground } from "@votewise/ui/dot-background";

import { Banner } from "@/app/(auth)/_components/banner";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="lg:flex-1 min-h-screen flex flex-col lg:items-end items-center lg:mr-20 justify-center">
        {props.children}
      </div>
      <div className="hidden w-full relative overflow-hidden flex-1 lg:flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">
          {() => <Banner title="Verify & Go!" subtitle="Let's Make It Official – Verify That Email!" />}
        </DotBackground>
      </div>
    </div>
  );
}
