import Image from "next/image";
import Link from "next/link";
import Planet from "@/assets/images/planet.svg";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden max-w-[880px] flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <div className="flex flex-col gap-5 ml-7 relative z-10">
          <h1 className="text-7xl leading-11">Create Account</h1>
          <p className="text-lg leading-7 font-light">We&apos;re so excited to have you join us!</p>
          <Link className="text-blue-400" href={routes.auth.signIn()}>
            Have an account?
          </Link>
        </div>

        <div className="absolute w-full -bottom-44 left-0">
          <div className="w-full relative h-[800px]">
            <Image src={Planet} fill alt="Planet" />
          </div>
        </div>
      </div>
    </div>
  );
}
