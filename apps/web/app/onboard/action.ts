"use server";

import { redirect } from "next/navigation";

export async function onboard(props: { redirectTo: string }) {
  const { redirectTo } = props;
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
  return redirect(redirectTo);
}
