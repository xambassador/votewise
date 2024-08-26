import Image from "next/image";
import Planet from "@/assets/images/planet.svg";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden max-w-[880px] flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <div className="absolute w-full inset-x-0">
          <div className="w-11/12 mx-auto relative h-[800px]">
            <Image src={Planet} fill alt="Planet" />
          </div>
        </div>
      </div>
    </div>
  );
}
