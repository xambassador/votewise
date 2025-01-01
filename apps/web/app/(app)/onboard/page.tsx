import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function Page() {
  return redirect(routes.onboard.step1());
}
