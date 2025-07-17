import Link from "next/link";

import { Button } from "@votewise/ui/button";

import { Planet } from "@/components/planet-svg";

export default function NotFoundPage() {
  return (
    <div className="at-max-viewport center relative overflow-hidden">
      <div className="relative flex flex-col max-w-4xl mx-auto gap-10 items-center p-10">
        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-7xl text-black-200 font-medium text-center">{title}</h1>
          <h2 className="text-2xl text-black-200 font-medium text-center">{subTitle}</h2>
          {dashedLine}
          <p className="text-black-300 text-lg text-center">{description}</p>
        </div>
        <Button asChild>
          <Link href="/">{label}</Link>
        </Button>
      </div>
      <Planet className="text-nobelBlack-200 absolute bottom-[calc((-200/16)*1rem)] left-1/2 -translate-x-1/2" />
    </div>
  );
}

const dashedLine = (
  <svg width="898" height="2" viewBox="0 0 898 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H897" stroke="#27272A" strokeLinecap="round" strokeDasharray="4 4" />
  </svg>
);

const title = "404 - Page not found";
const subTitle = "The Hamsters Powering This Page Need a Nap";
const description =
  "Our application runs on 100% renewable hamster energy. Unfortunately, all hamsters have simultaneously decided it&apos;s nap time.";
const label = "Teleport to Homepage";
