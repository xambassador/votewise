import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";

import { AuthForm, AuthScreenLayout, IllustrationSection, Logo } from "components";

import { getServerSession } from "server/lib/getServerSession";

import type { NextPageWithLayout } from "./_app";

const Page: NextPageWithLayout = () => (
  <>
    <IllustrationSection />
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <div className="flex w-[calc((530/16)*1rem)] flex-col items-center">
        <Logo />
        <div className="mt-7 w-full text-gray-800">
          <AuthForm
            type="login"
            title="Hey, Welcome back 👋"
            subtitle={
              <>
                New to VOTEWISE?{" "}
                <Link href="/signup" className="font-semibold text-blue-700">
                  Sign up now
                </Link>
              </>
            }
            submitButtonLabel="Sign In"
            showForgotPassword
          />
        </div>
      </div>
    </div>
  </>
);

Page.getLayout = (page) => <AuthScreenLayout>{page}</AuthScreenLayout>;

export default Page;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const session = getServerSession({ req, res });
  if (session) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
};
