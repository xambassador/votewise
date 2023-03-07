import { AuthForm, IllustrationSection } from "components";
import Image from "next/image";

import React from "react";

export default function Page() {
  return (
    <main className="h-screen w-screen bg-gray-50 text-white">
      <div className="flex h-full">
        <IllustrationSection />
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <div className="flex w-[calc((530/16)*1rem)] flex-col items-center">
            <figure>
              <Image src="/logo.png" alt="Logo" width={202} height={16} />
            </figure>

            <div className="mt-7 w-full text-gray-800">
              <AuthForm title="Hey, Hello 👋" subtitle="Register, and open new world." />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
