import { DotBackground } from "@votewise/ui/dot-background";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-h-screen flex flex-col items-end mr-20 justify-center">{props.children}</div>
      <div className="w-full relative overflow-hidden flex-1 flex flex-col justify-center border-l border-nobelBlack-200 min-h-screen">
        <DotBackground className="flex flex-col justify-center">{() => <Banner />}</DotBackground>
      </div>
    </div>
  );
}

function Banner() {
  return (
    <div className="flex flex-col gap-5 ml-12 relative max-w-fit z-[1]">
      <h1 className="text-7xl leading-11 text-black-100">Code, Please!</h1>
      <p className="text-lg leading-7 font-light">Are you really you? Let&apos;s find out!</p>
    </div>
  );
}
