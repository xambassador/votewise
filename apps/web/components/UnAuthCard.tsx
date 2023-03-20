import Link from "next/link";
import { useRouter } from "next/router";

import React from "react";

import { Spinner, makeToast } from "@votewise/ui";

import { useAsync } from "lib/hooks/useAsync";

import { signout } from "services/auth";

export function UnAuthCard() {
  const router = useRouter();
  const { status, run } = useAsync({
    data: null,
    error: null,
    status: "idle",
  });

  const handleOnNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    run(
      signout(),
      () => {
        router.push("/signin");
      },
      () => {
        makeToast("Something went wrong. Please clear your cookies and try again.", "error");
      }
    );
  };

  return (
    <div className="h-fit w-1/2 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Hey, Look&apos;s like you are not logged in.</h2>
        <p className="mt-5 flex items-center">
          Goto {status === "pending" && <Spinner className="ml-2 h-5 w-5" />}
          {status !== "pending" && (
            <Link href="/signin" className="ml-2 text-blue-600" onClick={handleOnNavigate}>
              Sign in
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
