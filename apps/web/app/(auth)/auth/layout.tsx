import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Props = { children: React.ReactNode };

export default function Layout(props: Props) {
  const user = auth();
  if (user) return redirect(routes.app.root());
  return <main className="w-screen min-h-screen">{props.children}</main>;
}
