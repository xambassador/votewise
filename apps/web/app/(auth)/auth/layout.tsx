import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  const user = isAuthorized();
  if (user) return redirect(routes.app.root());
  return <main className="w-screen min-h-screen">{props.children}</main>;
}
