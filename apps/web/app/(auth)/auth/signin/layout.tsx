import Link from "next/link";
import { getFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { DotBackground } from "@votewise/ui/dot-background";

import { FlashMessage } from "@/components/flash";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  const flashMessage = getFlashMessage();
  return (
    <div className="flex min-h-screen">
      {flashMessage && <FlashMessage {...flashMessage} />}
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden flex-1 flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">{() => <Banner />}</DotBackground>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="flex flex-col gap-5 ml-12 z-[1]">
      <h1 className="text-7xl leading-11 text-black-100">Sign in</h1>
      <p className="text-lg leading-7 font-light">Enter your username and password</p>
      <Link className="text-blue-400 w-fit" href={routes.auth.signUp()}>
        No Account? No Problem!
      </Link>
    </div>
  );
}
