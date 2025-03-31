import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

import { shouldNotOnboarded } from "./_utils";

export default async function Page() {
  await shouldNotOnboarded();
  return redirect(routes.onboard.step1());
}
