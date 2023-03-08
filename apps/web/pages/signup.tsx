import { AuthForm, AuthScreenLayout, IllustrationSection, Logo } from "components";

import React from "react";

import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => (
  <>
    <IllustrationSection />
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <div className="flex w-[calc((530/16)*1rem)] flex-col items-center">
        <Logo />
        <div className="mt-7 w-full text-gray-800">
          <AuthForm title="Hey, Hello 👋" subtitle="Register, and open new world." />
        </div>
      </div>
    </div>
  </>
);

Page.getLayout = (page) => <AuthScreenLayout>{page}</AuthScreenLayout>;

export default Page;
