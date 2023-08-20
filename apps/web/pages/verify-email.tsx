import type { GetServerSidePropsContext } from "next";

import React from "react";

import { verifyEmail } from "@/server/services/email";

type Props = {
  error: string;
};

export default function Page(props: Props) {
  const { error } = props;

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <div className="rounded-md bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-800">{error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-md bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-green-700">Your email has been verified!</h1>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { token } = context.query;

  const { data, error } = await verifyEmail(token as string);

  return {
    props: {
      data,
      error,
    },
  };
}
